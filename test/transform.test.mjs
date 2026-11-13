import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { UPSTREAM_MARK, build, check, packSkills, rewriteText, skillVersion, slug, validatePrefix } from '../lib/transform.mjs';

const SOURCE = new URL('../skills', import.meta.url).pathname;
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
  for (const prefix of ['ep', 'acme', 'my-co']) {
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
