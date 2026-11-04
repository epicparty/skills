// Turns the pack's unprefixed skills into skills named for one project's prefix,
// and checks that a set of installed skills is consistent with that prefix.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/** The prefix the pack's own text is written with. */
export const CANONICAL = 'ep';
export const MARKER = 'pack: epicparty/skills';

const PREFIX_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export function validatePrefix(prefix) {
  if (!PREFIX_RE.test(prefix ?? '')) {
    throw new Error(`Invalid prefix "${prefix}": use lowercase letters, digits and single hyphens, starting with a letter (e.g. "ep", "acme").`);
  }
  return prefix;
}

/** The skill folders of the pack: every directory holding a SKILL.md. */
export function packSkills(sourceDir) {
  return readdirSync(sourceDir)
    .filter((name) => existsSync(join(sourceDir, name, 'SKILL.md')))
    .sort();
}

/** The name a pack skill installs under. The router takes the bare prefix. */
export function installedName(skill, prefix) {
  return skill === CANONICAL ? prefix : `${prefix}-${skill}`;
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** One-pass rewrite of every canonical reference in a Markdown text. */
export function rewriteText(text, skills, prefix) {
  const names = [...skills].filter((s) => s !== CANONICAL).sort((a, b) => b.length - a.length).map(escape);
  const alt = names.join('|');
  const re = new RegExp(
    [
      // ../<skill>/  — a link into a sibling skill's folder
      `(?<link>\\.\\./)(?<dir>${escape(CANONICAL)}|${alt})(?=/)`,
      // ep-<skill> and ep-*  — a skill name, with or without its slash
      `(?<![\\w-])${escape(CANONICAL)}-(?<name>${alt}|\\*)(?![\\w-])`,
      // /ep  — the router's slash command
      `(?<![\\w/.-])/${escape(CANONICAL)}(?<router>)(?![\\w-])`,
    ].join('|'),
    'g',
  );
  return text.replace(re, (...args) => {
    const g = args.at(-1);
    if (g.link !== undefined) return `../${installedName(g.dir, prefix)}`;
    if (g.name !== undefined) return `${prefix}-${g.name}`;
    return `/${prefix}`;
  });
}

function rewriteFrontmatterName(text, skill, prefix) {
  const end = text.indexOf('\n---', 3);
  if (!text.startsWith('---\n') || end < 0) throw new Error(`${skill}/SKILL.md has no frontmatter`);
  const head = text.slice(0, end).replace(/^name: .*$/m, `name: ${installedName(skill, prefix)}`);
  return head + text.slice(end);
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Writes the prefixed skills into outDir, one folder per installed name. Returns the names. */
export function build(sourceDir, prefix, outDir) {
  validatePrefix(prefix);
  const skills = packSkills(sourceDir);
  if (!skills.includes(CANONICAL)) throw new Error(`The pack at ${sourceDir} has no "${CANONICAL}" router skill.`);
  mkdirSync(outDir, { recursive: true });
  for (const skill of skills) {
    const from = join(sourceDir, skill);
    const to = join(outDir, installedName(skill, prefix));
    for (const file of walk(from)) {
      const target = join(to, relative(from, file));
      mkdirSync(dirname(target), { recursive: true });
      if (!file.endsWith('.md')) {
        cpSync(file, target);
        continue;
      }
      let text = rewriteText(readFileSync(file, 'utf8'), skills, prefix);
      if (relative(from, file) === 'SKILL.md') text = rewriteFrontmatterName(text, skill, prefix);
      writeFileSync(target, text);
    }
  }
  return skills.map((s) => installedName(s, prefix));
}

/** GitHub's heading anchor: lowercase, punctuation dropped, spaces to hyphens. */
export function slug(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s/g, '-');
}

function anchors(text) {
  const seen = new Map();
  const out = new Set();
  for (const line of text.replace(/```[\s\S]*?```/g, '').split('\n')) {
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (!m) continue;
    const base = slug(m[1]);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.add(n === 0 ? base : `${base}-${n}`);
  }
  return out;
}

/**
 * Checks installed pack skills in dir (folders named <prefix>-<skill> and <prefix>).
 * Returns a list of problems; empty means consistent.
 */
export function check(dir, prefix, { canonicalSkills } = {}) {
  validatePrefix(prefix);
  const problems = [];
  const installed = readdirSync(dir).filter((name) => {
    const file = join(dir, name, 'SKILL.md');
    return existsSync(file) && readFileSync(file, 'utf8').includes(`\n  ${MARKER}\n`);
  });
  const set = new Set(installed);
  if (!set.has(prefix)) problems.push(`router "${prefix}" is not installed`);
  const nameRe = new RegExp(`(?<![\\w-])/?${escape(prefix)}-([a-z0-9]+(?:-[a-z0-9]+)*|\\*)(?![\\w-])`, 'g');
  const canonical = canonicalSkills?.filter((s) => s !== CANONICAL).map(escape).join('|');
  const leftover =
    prefix !== CANONICAL && canonical
      ? new RegExp(`(?<![\\w-])${CANONICAL}-(?:${canonical})(?![\\w-])|(?<![\\w/.-])/${CANONICAL}(?![\\w-])|\\.\\./${CANONICAL}/`, 'g')
      : null;

  for (const name of installed) {
    const root = join(dir, name);
    const skillText = readFileSync(join(root, 'SKILL.md'), 'utf8');
    const fm = /^---\n([\s\S]*?)\n---/.exec(skillText)?.[1] ?? '';
    const declared = /^name: (.*)$/m.exec(fm)?.[1];
    if (declared !== name) problems.push(`${name}/SKILL.md: name is "${declared}", folder is "${name}"`);
    if (!/^description: .+/m.test(fm)) problems.push(`${name}/SKILL.md: no description`);

    for (const file of walk(root).filter((f) => f.endsWith('.md'))) {
      const where = relative(dir, file);
      const text = readFileSync(file, 'utf8');
      const prose = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
      for (const m of prose.matchAll(/\]\(([^)\s]+)\)/g)) {
        const href = m[1];
        if (/^[a-z]+:/i.test(href)) continue;
        const [path, hash] = href.split('#');
        const target = path ? resolve(dirname(file), path) : file;
        if (!existsSync(target)) {
          problems.push(`${where}: link ${href} points to a missing file`);
          continue;
        }
        if (hash && target.endsWith('.md') && !anchors(readFileSync(target, 'utf8')).has(hash)) {
          problems.push(`${where}: link ${href} points to a missing heading`);
        }
      }
      for (const m of text.matchAll(nameRe)) {
        if (m[1] !== '*' && !set.has(`${prefix}-${m[1]}`)) problems.push(`${where}: names ${m[0]}, which is not installed`);
      }
      if (leftover) for (const m of text.matchAll(leftover)) problems.push(`${where}: canonical reference "${m[0]}" was not rewritten`);
    }
  }
  return problems;
}
