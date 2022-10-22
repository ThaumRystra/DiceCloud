# Computed fields

Some fields in DiceCloud creature properties expect calculations. These fields are then computed by the DiceCloud engine.

Some fields, like the value of an attirbute, resolve down to a single number, while others, like the damage to deal in an attack, only simplify their calculation as far as they can, and then resolve down to a number when applied. Avoid adding dice rolls to calculations that expect to resolve down to a number, because they will re-roll every time the creature is recalculated, causing instability in the creature's stats.

## Parser

The DiceCloud parser can understand the following syntax:

|  |  |
| :- | :- |
| **Numbers** | `13`, `3.14` |
| **Dice rolls** | `3d6`, `(1 + 2)d4`|
| **Strings of text** | `'Some text'`, `"some other text"` |
| **Boolean values** | `true` or `false`. When DiceCloud expects a boolean, `0`, an empty string `''` and `false` are all considered false by DiceCloud's engine, every other value is considered true. |
| **Variable names** | `variableName` |
| **Addition and subtraction** | `1 + 2 + 3`, `12 - 6` |
| **Multiplication** | `6 * 4`, `12 * 2` = `24` |
| **Exponents** | `3 ^ 2` Raise 3 to the power of 2 |
| **Modulo** | Returns the remainder of a division operation `15 % 6` = `3` |
| **AND** | `&` or `&&`: Returns the value of the right hand side if the left side is true `true & 'cat'` = `'cat'` |
| **OR** | `|` or `||`: Returns the left hand side if it is true, otherwise returns the right hand side `'dog' || 'cat'` = `'dog'` |
| **NOT** | `!` returns false if the value after it is true, otherwise returns false  |
| **Comparisons** | greater than: `>`, less than: `<`, greater than or equal to: `>=`, less than or equal to: `<=`, equal: `=` or `==` or `===`, not equal: `!=` or `!==` |
| **If-else** | `condition ? resultIfTrue : resultIfFalse`, `level > 10 ? 'high tier' : 'low tier'` |
| **Arrays** | lists of values `[3, 6, 9, 12]`. |
| **Array Indexes** | A value can be chosen from an array using another set of square brackets: `[3, 6, 9, 12][2]` = `[6]` because `[2]` fetches the 2nd value in the array. Arrays start at 1 in DiceCloud so that level tables can have 20 entries and be accessed by `array[level]`. |
| **Function calls** | `functionName(argument1, argument1)` See [Functions](/docs/functions) for a full list of available functions. |

## Special variables

### Built-in variables

These variables are added to the creature automatically when relevant. They can be overriden if needed by creating a property with the same variable name. They can also be targetted by effects.

- `xp` A total of all the experiences with xp added to the character sheet
- `milestoneLevels` A total of all the experiences with milestone levels added to the character sheet
- `itemsAttuned` Number of items the creature is attuned to
- `weightEquipment` Total weight of all equipment on the creature
- `valueEquipment` Total value of all equipment on the creature
- `weightTotal` Total weight of the creature's entire inventory
- `valueTotal` Total value of the creature's entire inventory
- `weightCarried` Total weight of all carried items and containers
- `valueCarried` Total value of all carried items and containers
- `level` The current level of the creature, including all class levels
- `criticalHitTarget` Defaults to 20, the natural roll needed to consider an attack roll as a critical hit

### Action variables

These variables are available during an action after the relevant property has been applied.

For Advanced users, a [Roll](/docs/property/roll) can set these variables, overriding the default behavior.

#### [Actions](/docs/property/action)

- `$attackDiceRoll` The value of the d20 roll before any modifiers were applied.
- `$attackRoll` The total attack roll after modifiers.
- `$criticalHit` Set to `true` if the attack roll's d20 is a natural 20. If `criticalHitTarget` is set, the attack roll's d20 must instead be equal to or greater than `criticalHitTarget` for this to be set to `true`.
- `$criticalMiss` Set to `true` if the attack roll was not a critical hit and rolled a natural 1 on the d20 roll.
- `$attackHit` If the attack roll is higher than or equal to the target's AC or a critical hit this is set to `true`. Remains unset if there is no target for the attack unless the attack is a critical hit.
- `$attackMiss` If the attack roll is lower than the target's AC or a critical miss, this is set to `true`. Remains unset if there is no target for the attack unless the attack is a critical miss.

#### [Damage](/docs/property/damage)

- `$lastDamageType` The type of damage dealt last, any damage that has the `extra` type will use this damage type instead

#### [Saving throws](/docs/property/saving-throw)

- `$saveFailed` Set to `true` if the target failed its saving throw or there are no targets for the saving throw
- `$saveSucceeded` Set to `true` if the target made its saving throw or there are no targets for the saving throw
- `$saveDiceRoll` The unmodified d20 roll the target made to save
- `$saveRoll` The final value of the saving throw roll after modifiers

## Ancestor references

The ancestors of a property can be accessed directly using the `#ancestorType` syntax.

For example, a spell might need to know the save DC of the spell list that it is inside of, it can use `#spellList.dc`.

Triggers and their children work differently: They don't have access to their own ancestors, but rather inherit the ancestors of the property that caused them to fire. For example, a trigger at the root of the creature's tree might be fired by a spell being cast, you can still use references to ancestors like `#spellList.attackRollBonus` inside that trigger as if it were under the spell itself.
