// `/ep-setup` reads every skill's `## Settings` section: it recommends a value for each setting
// from its "Recommend when" column, and compares the shared steps for drift. These tests keep the
// sections in the shape it reads.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { packSkills } from '../lib/transform.mjs';

const SOURCE = new URL('../skills', import.meta.url).pathname;

/** Each skill's `## Settings` section, for the skills that have one. */
const sections = packSkills(SOURCE).flatMap((skill) => {
  const text = readFileSync(join(SOURCE, skill, 'SKILL.md'), 'utf8');
  const m = /\n## Settings\n([\s\S]*?)(?=\n## |$)/.exec(text);
  return m ? [{ skill, body: m[1] }] : [];
});

/** The numbered steps that find a setting: from step 1 to the end of step 3. */
function sharedSteps(body) {
  return /^1\. \*\*The settings home\.\*\*[\s\S]*?^3\. \*\*Missing\.\*\*.*$/m.exec(body)?.[0] ?? null;
}

/** Each `###` setting in a section: its heading and its body. */
function settings(body) {
  return body
    .split(/^### /m)
    .slice(1)
    .map((chunk) => {
      const [heading, ...rest] = chunk.split('\n');
      return { heading, body: rest.join('\n') };
    });
}

describe('settings sections', () => {
  it('exist', () => assert.ok(sections.length > 0));

  it('share identical steps wherever they carry them', () => {
    const copies = sections.flatMap(({ skill, body }) => {
      const steps = sharedSteps(body);
      return steps ? [{ skill, steps }] : [];
    });
    assert.ok(copies.length > 1);
    const router = copies.find((c) => c.skill === 'router');
    assert.ok(router, 'the router carries the steps');
    for (const { skill, steps } of copies) assert.equal(steps, router.steps, `${skill} drifted from the router's steps`);
  });

  for (const { skill, body } of sections) {
    for (const setting of settings(body)) {
      it(`${skill} "${setting.heading}" declares a topic, a question and a recommendation for setup`, () => {
        assert.match(setting.body, /^Topic `[a-z-]+`\. Question: \*[^*]+\*$/m);
        const table = setting.body.split('\n').filter((line) => line.startsWith('|'));
        assert.equal(table[0], '| Option | Follow-up | Recommend when |');
        const rows = table.slice(2).map((line) => line.split(' | ').map((cell) => cell.replace(/^\| |\s*\|$/g, '').trim()));
        assert.ok(rows.length > 0, 'no options');
        for (const row of rows) assert.match(row[0], /^\*\*.+\*\*$/, 'an option is named in bold');
        assert.ok(rows.some((row) => row.at(-1) !== '—'), 'no option says when to recommend it');
      });
    }
  }
});
