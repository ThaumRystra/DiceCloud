import RA_DICE from '/imports/constants/RA_DICE';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import numberToSignedString from '/imports/api/utility/numberToSignedString';

/**
 * Reverent Abyss core roll: 2d10 + modifier.
 * Net advantage N rolls 2 + |N| d10, keeping the 2 highest (N > 0) or 2 lowest (N < 0).
 */
export type CoreDiceResult = {
  kept: number[];
  all: number[];
  dropped: number[];
  keptSum: number;
  total: number;
  advantage: number;
  logText: string;
};

/**
 * Clamp a net advantage to an integer in [-maxAdvantage, maxAdvantage].
 * Values can come from saved client decisions that the server replays unvalidated.
 */
export function clampAdvantage(netAdvantage: unknown): number {
  const num = Number(netAdvantage);
  if (!Number.isFinite(num)) return 0;
  const clamped = Math.max(-RA_DICE.maxAdvantage, Math.min(RA_DICE.maxAdvantage, Math.trunc(num)));
  // Avoid -0
  return clamped || 0;
}

/**
 * Suffix for result names, e.g. ' (Advantage +2)', ' (Disadvantage −1)', or ''
 */
export function advantageSuffix(advantage: number): string {
  if (advantage > 0) return ` (Advantage +${advantage})`;
  if (advantage < 0) return ` (Disadvantage −${Math.abs(advantage)})`;
  return '';
}

export default async function rollCoreDice(
  input: InputProvider, netAdvantage: number, modifier: number
): Promise<CoreDiceResult> {
  const advantage = clampAdvantage(netAdvantage);
  const { keep, diceSize } = RA_DICE;

  // Exactly one rollDice call, deterministic replay depends on call order
  const [rolled] = await input.rollDice([{ number: keep + Math.abs(advantage), diceSize }]);
  const all = [...rolled];

  // Sort indices by value, highest first with advantage, lowest first otherwise.
  // Ties keep the earlier die and drop the later one.
  const order = all.map((_, index) => index);
  order.sort((a, b) => {
    const byValue = advantage >= 0 ? all[b] - all[a] : all[a] - all[b];
    return byValue || a - b;
  });
  const keptIndices = new Set(order.slice(0, keep));

  const kept: number[] = [];
  const dropped: number[] = [];
  all.forEach((value, index) => {
    if (keptIndices.has(index)) kept.push(value);
    else dropped.push(value);
  });

  const keptSum = kept.reduce((sum, value) => sum + value, 0);
  const safeModifier = Number.isFinite(modifier) ? modifier : 0;
  const total = keptSum + safeModifier;

  const diceText = all.map(
    (value, index) => keptIndices.has(index) ? `${value}` : `~~${value}~~`
  ).join(', ');
  let logText = `${keep}d${diceSize} [ ${diceText} ] ${numberToSignedString(safeModifier, true)}`;
  if (advantage > 0) {
    logText = `Advantage +${advantage}\n${logText}`;
  } else if (advantage < 0) {
    logText = `Disadvantage −${Math.abs(advantage)}\n${logText}`;
  }

  return { kept, all, dropped, keptSum, total, advantage, logText };
}

/**
 * Write `${prefix}Die1`, `${prefix}Die2` (kept dice in roll order) and
 * `${prefix}DiceRoll` (kept sum) to a pushScope object
 */
export function writeCoreDiceScope(
  pushScope: Record<string, any>, prefix: string, roll: CoreDiceResult
) {
  roll.kept.forEach((value, index) => {
    pushScope[`${prefix}Die${index + 1}`] = { value };
  });
  pushScope[`${prefix}DiceRoll`] = { value: roll.keptSum };
}
