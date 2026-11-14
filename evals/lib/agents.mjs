// Runs one agent session, unattended, in a prepared project. Returns the transcript lines, the
// final reply, and how many questions the agent put to the user.
import { spawnSync } from 'node:child_process';

const TIMEOUT_MS = 20 * 60_000;

function jsonLines(text) {
  return text.split('\n').flatMap((line) => {
    try {
      return line.trim() ? [JSON.parse(line)] : [];
    } catch {
      return [];
    }
  });
}

export const agents = {
  /**
   * Claude Code in print mode. Project settings only, no MCP servers and no saved session, so the
   * user's own configuration stays out of the run; the skills come from the project's
   * .claude/skills.
   */
  claude(dir, prompt, { model } = {}) {
    const args = [
      '-p', prompt,
      '--output-format', 'stream-json', '--verbose',
      '--dangerously-skip-permissions',
      '--setting-sources', 'project',
      '--strict-mcp-config',
      '--no-session-persistence',
      ...(model ? ['--model', model] : []),
    ];
    const r = spawnSync('claude', args, { cwd: dir, encoding: 'utf8', timeout: TIMEOUT_MS, maxBuffer: 256 * 1024 * 1024 });
    const events = jsonLines(r.stdout ?? '');
    const result = events.findLast((e) => e.type === 'result');
    const toolUses = events
      .filter((e) => e.type === 'assistant')
      .flatMap((e) => e.message?.content ?? [])
      .filter((c) => c.type === 'tool_use');
    return {
      status: r.status,
      error: r.error?.message ?? (r.status === 0 ? null : (r.stderr ?? '').slice(-2000)),
      output: result?.result ?? '',
      questions: toolUses.filter((t) => t.name === 'AskUserQuestion').length,
      transcript: r.stdout ?? '',
    };
  },

  /** Codex in exec mode; its skills come from the project's .agents/skills. */
  codex(dir, prompt, { model } = {}) {
    const args = [
      'exec', '--json',
      '--dangerously-bypass-approvals-and-sandbox',
      '-C', dir,
      ...(model ? ['-m', model] : []),
      prompt,
    ];
    const r = spawnSync('codex', args, { cwd: dir, encoding: 'utf8', timeout: TIMEOUT_MS, maxBuffer: 256 * 1024 * 1024 });
    const events = jsonLines(r.stdout ?? '');
    const messages = events.filter((e) => e.type === 'item.completed' && e.item?.type === 'agent_message');
    return {
      status: r.status,
      error: r.error?.message ?? (r.status === 0 ? null : (r.stderr ?? '').slice(-2000)),
      output: messages.at(-1)?.item?.text ?? '',
      // Codex exec has no question tool: an unattended run cannot ask, so a question shows only in
      // its final reply, which `output-matches` can grade.
      questions: 0,
      transcript: r.stdout ?? '',
    };
  },
};
