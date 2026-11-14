// Builds one throwaway project for a task: the fixture as a git repo on `main`, the pack's skills
// installed under the prefix `ev`, and, where the task asks for them, settings already answered.
import { execFileSync } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../../lib/transform.mjs';

export const PREFIX = 'ev';
const EVALS = new URL('..', import.meta.url).pathname;

export function git(dir, ...args) {
  return execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

/** Every task folder under evals/tasks, with its task.json read. */
export function loadTasks() {
  const root = join(EVALS, 'tasks');
  return execFileSync('ls', [root], { encoding: 'utf8' })
    .split('\n')
    .filter((name) => name && existsSync(join(root, name, 'task.json')))
    .map((name) => ({ name, dir: join(root, name), ...JSON.parse(readFileSync(join(root, name, 'task.json'), 'utf8')) }));
}

/**
 * Prepares a fresh project for the task and returns { dir, base }: base is the commit the agent
 * starts from. The folder name says nothing about evaluation, so the agent works as it would on a
 * real project.
 */
export function prepare(task, skillsDir) {
  const dir = mkdtempSync(join(tmpdir(), 'work-'));
  cpSync(join(task.dir, 'fixture'), dir, { recursive: true });
  if (task.settings) cpSync(join(EVALS, 'settings-ev'), dir, { recursive: true });
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 'dev@example.com');
  git(dir, 'config', 'user.name', 'Dev');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'chore: initial commit');
  if (task.branch) {
    git(dir, 'switch', '-q', '-c', task.branch.name);
    cpSync(join(task.dir, 'branch'), dir, { recursive: true });
    git(dir, 'add', '-A');
    git(dir, 'commit', '-q', '-m', task.branch.message);
  }
  const base = git(dir, 'rev-parse', 'HEAD');
  // Skills go in after the base commit and stay untracked, the way a project's installed skills
  // would sit outside the work under review.
  for (const home of ['.claude/skills', '.agents/skills']) build(skillsDir, PREFIX, join(dir, home));
  appendFileSync(join(dir, '.git', 'info', 'exclude'), '.claude/\n.agents/\n');
  return { dir, base };
}
