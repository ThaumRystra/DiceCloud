# Inline Calculations

Most long-format fields allow inline [calculations](/docs/computed-fields) to be included. Calculations inside of curly bracers will be computed down to numbers using the characters stats.

For example a creature's strength attribute may have the following in its description:  `Your carrying capacity is {strength * 15} lbs.`

When the creature is calculated, if it has 8 strength, the action description will become: "Your carrying capacity is 120 lbs."

If a description includes a dice roll, only the part that can be calculated to a single number should be included in the calulation bracers: `The attack does an extra {paladin.level}d8 damage`, which becomes `The attack does an extra 4d8 damage`.

Do not inlclude the dice roll in the calaculation: `The attack does an extra {(paladin.level)d8} damage`, because it will become `The attack does an extra 16 damage` but the number 16 will change every time the creature recalculates.
