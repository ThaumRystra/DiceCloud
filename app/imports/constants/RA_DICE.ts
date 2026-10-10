export default {
  diceSize: 10,
  keep: 2,
  critBase: 20,        // kept sum needed to crit, before critChance
  maxAdvantage: 10,    // clamp for |net advantage|
} as const;
