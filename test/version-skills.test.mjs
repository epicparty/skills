import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bumpVersion, parseChangeset, setSkillVersion, skillBumps } from '../scripts/version-skills.mjs';

const PKG = '@epicparty/skills';

describe('parseChangeset', () => {
  it('reads the package bump and the skills that lead the entry', () => {
    const text = '---\n"@epicparty/skills": minor\n---\n\n`implement`, `triage` and `to-story`: read the Labels setting first. See `GIT.md`.\n';
    assert.deepEqual(parseChangeset(text, PKG), { bump: 'minor', skills: ['implement', 'triage', 'to-story'] });
  });
  it('names no skill when the entry does not lead with them', () => {
    const text = "---\n'@epicparty/skills': patch\n---\n\nThe CLI prints each skill's version change. `implement` is unchanged.\n";
    assert.deepEqual(parseChangeset(text, PKG), { bump: 'patch', skills: [] });
  });
  it('ignores another package', () => {
    assert.equal(parseChangeset('---\n"other": major\n---\n\n`implement`: x\n', PKG).bump, null);
  });
});

describe('bumpVersion', () => {
  it('bumps like semver', () => {
    assert.equal(bumpVersion('0.1.0', 'patch'), '0.1.1');
    assert.equal(bumpVersion('0.1.3', 'minor'), '0.2.0');
    assert.equal(bumpVersion('0.4.2', 'major'), '1.0.0');
  });
});

describe('skillBumps', () => {
  it('keeps the highest bump for a skill named twice', () => {
    const bumps = skillBumps([
      { bump: 'patch', skills: ['implement', 'triage'] },
      { bump: 'minor', skills: ['implement'] },
    ]);
    assert.deepEqual(bumps, { implement: 'minor', triage: 'patch' });
  });
});

describe('setSkillVersion', () => {
  it('replaces only the frontmatter version', () => {
    const text = '---\nname: x\nmetadata:\n  pack: epicparty/skills\n  version: 0.1.0\n---\n\n  version: 9.9.9 in the body\n';
    assert.equal(setSkillVersion(text, '0.2.0'), text.replace('  version: 0.1.0', '  version: 0.2.0'));
  });
});
