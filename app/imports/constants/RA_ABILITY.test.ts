import { assert } from 'chai';
import { abilityModifier } from '/imports/constants/RA_ABILITY';

// The table from the Reverent Abyss doc, written out as ranges: [min, max, modifier]
const TABLE_ROWS: [number, number, number][] = [
  [2, 3, -3],
  [4, 5, -2],
  [6, 6, -1],
  [7, 7, 0],
  [8, 8, 1],
  [9, 10, 2],
  [11, 12, 3],
  [13, 15, 4],
  [16, 18, 5],
  [19, 22, 6],
  [23, 26, 7],
  [27, 31, 8],
  [32, 36, 9],
  [37, 42, 10],
  [43, 48, 11],
  [49, 55, 12],
  [56, 62, 13],
  [63, 69, 14],
];

describe('RA ability modifiers', function () {
  it('matches every row of the table', function () {
    for (const [min, max, modifier] of TABLE_ROWS) {
      for (let stat = min; stat <= max; stat++) {
        assert.equal(abilityModifier(stat), modifier, `stat ${stat}`);
      }
    }
  });

  it('caps at +15 from 70 up', function () {
    for (const stat of [70, 71, 89, 90, 1000]) {
      assert.equal(abilityModifier(stat), 15, `stat ${stat}`);
    }
  });

  it('gives −4 below the table', function () {
    assert.equal(abilityModifier(1), -4);
    assert.equal(abilityModifier(0), -4);
    assert.equal(abilityModifier(-5), -4);
  });

  it('rounds fractional stats down to the threshold they meet', function () {
    assert.equal(abilityModifier(6.9), -1);
    assert.equal(abilityModifier(7.5), 0);
  });

  it('returns NaN for non-finite stats', function () {
    assert.isNaN(abilityModifier(NaN));
    assert.isNaN(abilityModifier(Infinity));
    assert.isNaN(abilityModifier(undefined as unknown as number));
  });
});
