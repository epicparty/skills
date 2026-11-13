#!/usr/bin/env node
// Each skill carries its own version, `metadata.version` in its SKILL.md. Changesets versions only
// the package, so this script versions the skills from the same changesets.
//
// A changeset names the skills it changes at the start of its entry: "`implement`, `triage`: …".
//
//   node scripts/version-skills.mjs            Bump every named skill by its changesets' highest bump.
//                                              Runs in `npm run version`, before `changeset version`
//                                              deletes the changesets.
//   node scripts/version-skills.mjs --check [base]
//                                              Change nothing. Fail when a skill changed since base
//                                              (default origin/main) is named by no pending changeset,
//                                              or a changeset names a skill that does not exist.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEVELS = ['patch', 'minor', 'major'];

/** The package bump and the skills a changeset names. */
export function parseChangeset(text, packageName) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text);
  if (!m) return { bump: null, skills: [] };
  const name = packageName.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const bump = new RegExp(`^\\s*["']?${name}["']?\\s*:\\s*(patch|minor|major)\\s*$`, 'm').exec(m[1])?.[1] ?? null;
  const lead = /^((?:`[a-z0-9-]+`(?:\s*,\s*|\s+and\s+)?)+):/.exec(m[2].trim());
  const skills = lead ? [...lead[1].matchAll(/`([a-z0-9-]+)`/g)].map((x) => x[1]) : [];
  return { bump, skills };
}

/** Semver bump, the way Changesets bumps a package. */
export function bumpVersion(version, level) {
  const [major, minor, patch] = version.split('-')[0].split('.').map(Number);
  if (level === 'major') return `${major + 1}.0.0`;
  if (level === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/** The SKILL.md text with its frontmatter's metadata.version replaced. */
export function setSkillVersion(text, version) {
  const end = text.indexOf('\n---', 3);
  const head = text.slice(0, end);
  if (!/^ {2}version: \S+\s*$/m.test(head)) throw new Error('no metadata.version in the frontmatter');
  return head.replace(/^ {2}version: \S+\s*$/m, `  version: ${version}`) + text.slice(end);
}

/** For each named skill, the highest bump among the changesets that name it. */
export function skillBumps(changesets) {
  const bumps = {};
  for (const { bump, skills } of changesets) {
    if (!bump) continue;
    for (const skill of skills) {
      if (!bumps[skill] || LEVELS.indexOf(bump) > LEVELS.indexOf(bumps[skill])) bumps[skill] = bump;
    }
  }
  return bumps;
}

function pendingChangesets(root, packageName) {
  const dir = join(root, '.changeset');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => ({ file: f, ...parseChangeset(readFileSync(join(dir, f), 'utf8'), packageName) }));
}

function main() {
  const packageName = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).name;
  const skillsDir = join(ROOT, 'skills');
  const known = new Set(readdirSync(skillsDir).filter((s) => existsSync(join(skillsDir, s, 'SKILL.md'))));
  const changesets = pendingChangesets(ROOT, packageName);

  const unknown = changesets.flatMap(({ file, skills }) => skills.filter((s) => !known.has(s)).map((s) => `${file}: "${s}"`));
  if (unknown.length) {
    console.error(`Changesets name skills that do not exist (use the folder name under skills/):\n  ${unknown.join('\n  ')}`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (args[0] === '--check') {
    const base = args[1] ?? 'origin/main';
    const diff = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`, '--', 'skills/'], { cwd: ROOT, encoding: 'utf8' });
    const changed = new Set(diff.split('\n').filter(Boolean).map((p) => p.split('/')[1]).filter((s) => known.has(s)));
    const named = new Set(changesets.flatMap((c) => c.skills));
    const missing = [...changed].filter((s) => !named.has(s)).sort();
    if (missing.length) {
      console.error(`These skills changed since ${base}, and no changeset names them: ${missing.join(', ')}.`);
      console.error('Add one with `npx changeset`, starting its entry with the skills in backticks — see .changeset/README.md.');
      process.exit(1);
    }
    console.log(`OK: every skill changed since ${base} is named by a changeset (${changed.size} changed).`);
    return;
  }

  const bumps = skillBumps(changesets);
  for (const [skill, level] of Object.entries(bumps).sort()) {
    const path = join(skillsDir, skill, 'SKILL.md');
    const text = readFileSync(path, 'utf8');
    const current = /^ {2}version: (\S+)\s*$/m.exec(text)?.[1];
    if (!current) throw new Error(`${skill}/SKILL.md has no metadata.version`);
    const next = bumpVersion(current, level);
    writeFileSync(path, setSkillVersion(text, next));
    console.log(`${skill}: ${current} -> ${next} (${level})`);
  }
  if (!Object.keys(bumps).length) console.log('No changeset names a skill: no skill version changes.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
