/**
 * Reverent Abyss stat → modifier table
 * Source: Reverent Abyss TTRPG System doc (06/10/2026), "Correlating stat to their bonus".
 * A stat uses the modifier of the highest threshold it meets ("round down").
 * Stats below 2 are undefined in the rules and get one less than the lowest modifier (−4).
 * Stats of 70 and above cap at +15.
 */
export const STAT_THRESHOLDS = [2, 4, 6, 7, 8, 9, 11, 13, 16, 19, 23, 27, 32, 37, 43, 49, 56, 63, 70] as const;
export const STAT_MODIFIERS = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;

/**
 * Modifier for a Reverent Abyss ability score.
 * Non-finite scores return NaN, like the upstream formula, so errors stay visible.
 */
export function abilityModifier(stat: number): number {
  if (!Number.isFinite(stat)) return NaN;
  let mod: number = STAT_MODIFIERS[0] - 1; // below table
  for (let i = 0; i < STAT_THRESHOLDS.length; i++) {
    if (stat >= STAT_THRESHOLDS[i]) mod = STAT_MODIFIERS[i];
  }
  return mod;
}
