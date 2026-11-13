import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { UPSTREAM_MARK, build, check, checkSource, packSkills, rewriteText, skillVersion, slug, validatePrefix } from '../lib/transform.mjs';

const SOURCE = new URL('../skills', import.meta.url).pathname;
const CLI = new URL('../bin/cli.mjs', import.meta.url).pathname;
const skills = packSkills(SOURCE);
const tmp = mkdtempSync(join(tmpdir(), 'epicparty-skills-test-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

describe('rewriteText', () => {
  const names = ['router', 'implement', 'to-pr', 'to-story'];
  it('rewrites slash commands, names, wildcards and sibling links', () => {
    const text = 'Run `/ep`, then [`/ep-implement`](../implement/SKILL.md) and `/ep-to-pr`; read `/ep`\'s [`GIT.md`](../router/GIT.md). Every `ep-*` skill.';
    assert.equal(
      rewriteText(text, names, 'acme'),
      'Run `/acme`, then [`/acme-implement`](../acme-implement/SKILL.md) and `/acme-to-pr`; read `/acme`\'s [`GIT.md`](../acme/GIT.md). Every `acme-*` skill.',
    );
  });
  it('leaves unrelated text alone', () => {
    const text = 'EP-42, SHOP-184, step-by-step, keep-going, /epic, ep-unknown, docs/ep/x, ./STORIES.md';
    assert.equal(rewriteText(text, names, 'acme'), text);
  });
  it('does not rewrite twice when the prefix starts like the canonical one', () => {
    assert.equal(rewriteText('[x](../to-story/S.md) `/ep-to-story`', names, 'ep-to'), '[x](../ep-to-to-story/S.md) `/ep-to-to-story`');
  });
});

describe('validatePrefix', () => {
  for (const ok of ['ep', 'acme', 'my-co', 'a1']) it(`accepts ${ok}`, () => assert.equal(validatePrefix(ok), ok));
  for (const bad of ['', 'Ep', '-ep', 'ep-', 'e p', '1ep', 'ep--x']) it(`rejects "${bad}"`, () => assert.throws(() => validatePrefix(bad)));
});

describe('slug', () => {
  it('matches GitHub anchors', () => {
    assert.equal(slug('4. Walk it'), '4-walk-it');
    assert.equal(slug('2. Hold it to one goal'), '2-hold-it-to-one-goal');
    assert.equal(slug('`/ep` settings'), 'ep-settings');
  });
});

describe('the pack', () => {
  it('gives every skill its own semver version', () => {
    for (const s of skills) assert.match(skillVersion(join(SOURCE, s)) ?? '', /^\d+\.\d+\.\d+(-[\w.]+)?$/, s);
  });
  it('has the router and a marker on every skill', () => {
    assert.ok(skills.includes('router'));
    assert.ok(!skills.includes('ep'));
    for (const s of skills) assert.match(readFileSync(join(SOURCE, s, 'SKILL.md'), 'utf8'), /\n {2}pack: epicparty\/skills\n/);
  });
  it('names only its own skills', () => {
    assert.deepEqual(checkSource(SOURCE), []);
  });
  // `up`, `re`, `co` and `self` start English words in the text: up-to-date, re-read, co-occur, self-contained.
  for (const prefix of ['ep', 'acme', 'my-co', 'up', 're', 'co', 'self']) {
    it(`builds consistently for prefix "${prefix}"`, () => {
      const out = join(tmp, prefix);
      const names = build(SOURCE, prefix, out);
      assert.equal(names.length, skills.length);
      assert.ok(names.includes(prefix));
      assert.deepEqual(check(out, prefix, { canonicalSkills: skills }), []);
    });
    it(`leaves no router folder link for prefix "${prefix}"`, () => {
      const text = readFileSync(join(tmp, prefix, `${prefix}-deliver`, 'SKILL.md'), 'utf8');
      assert.ok(!text.includes('../router/'));
      assert.ok(text.includes(`../${prefix}/BOARD.md`));
    });
  }
  it('keeps each skill\'s version through the build', () => {
    assert.equal(skillVersion(join(tmp, 'acme', 'acme-implement')), skillVersion(join(SOURCE, 'implement')));
  });
  it('ships the NOTICE with every skill that carries adapted text, and only with those', () => {
    for (const s of skills) {
      const name = s === 'router' ? 'acme' : `acme-${s}`;
      const adapted = readFileSync(join(tmp, 'acme', name, 'SKILL.md'), 'utf8').includes(UPSTREAM_MARK)
        || ['implement', 'to-story', 'router'].includes(s);
      assert.equal(existsSync(join(tmp, 'acme', name, 'NOTICE')), adapted, s);
    }
  });
});

// A pack of two skills, written to dir: the router and implement, whose text is given.
function miniPack(dir, implementText) {
  const skill = (name, body) => {
    mkdirSync(join(dir, name), { recursive: true });
    writeFileSync(
      join(dir, name, 'SKILL.md'),
      `---\nname: ${name}\ndescription: ${name}.\nmetadata:\n  pack: epicparty/skills\n  version: 0.1.0\n---\n\n${body}\n`,
    );
  };
  skill('router', 'Start with `/ep-implement`. Every `ep-*` skill.');
  skill('implement', implementText);
  return dir;
}

describe('checkSource', () => {
  it('reports a reference to a skill the pack does not have', () => {
    const src = miniPack(join(tmp, 'src-typo'), 'Then run `/ep-implment`, and never `ep-router`.');
    assert.deepEqual(checkSource(src), [
      'implement/SKILL.md: names /ep-implment, which is not a skill in the pack',
      'implement/SKILL.md: names ep-router, which is not a skill in the pack',
    ]);
  });
});

describe('check', () => {
  it('reads a word that starts with the prefix as text, not as a skill', () => {
    const src = miniPack(join(tmp, 'src-words'), 'Cut from an up-to-date base, then up-implement-ish things. Back to `/ep`.');
    const out = join(tmp, 'words-up');
    build(src, 'up', out);
    assert.deepEqual(check(out, 'up', { canonicalSkills: packSkills(src) }), []);
  });
  it('still reports a skill that is named but not installed', () => {
    const out = join(tmp, 'missing-up');
    build(SOURCE, 'up', out);
    rmSync(join(out, 'up-implement'), { recursive: true });
    const problems = check(out, 'up', { canonicalSkills: skills });
    assert.ok(problems.length > 0);
    assert.ok(problems.every((p) => /names \/?up-implement, which is not installed|points to a missing/.test(p)), problems.join('\n'));
    assert.ok(problems.some((p) => p.endsWith('names /up-implement, which is not installed')));
  });
  it('needs the pack\'s skills', () => {
    assert.throws(() => check(join(tmp, 'up'), 'up'), /canonicalSkills/);
  });
});

describe('the CLI', () => {
  const run = (args, cwd) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
  for (const prefix of ['up', 're', 'co', 'self']) {
    it(`builds and checks the pack for prefix "${prefix}"`, () => {
      const r = run(['build', '--prefix', prefix, '--out', join(tmp, `cli-${prefix}`)]);
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, new RegExp(`^Built ${skills.length} skills`));
    });
  }
  it('fails a build whose source names a missing skill', () => {
    const src = miniPack(join(tmp, 'src-cli-typo'), 'Then run `/ep-implment`.');
    const r = run(['build', '--from', src, '--prefix', 'up', '--out', join(tmp, 'cli-typo')]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /names \/ep-implment, which is not a skill in the pack/);
  });
  it('says check has no epicparty-skills.json to read the prefix from', () => {
    const cwd = mkdtempSync(join(tmp, 'empty-'));
    const r = run(['check'], cwd);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /no epicparty-skills\.json here.*pass --prefix/);
  });
  it('checks an installed project', () => {
    const cwd = mkdtempSync(join(tmp, 'project-'));
    cpSync(join(tmp, 'cli-up'), join(cwd, '.agents', 'skills'), { recursive: true });
    const r = run(['check', '--prefix', 'up'], cwd);
    assert.equal(r.status, 0, r.stderr);
  });
});
