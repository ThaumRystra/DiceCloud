# Buffs

Buffs are temporary changes to a character sheet that can be applied by actions. When a buff is applied, it is copied to the target character along with all of its children properties. 

Buffs can either be manually removed from the stats page, or be removed by an action applying a [buff remover](/docs/property/remove-buff/) property.

### Variable freezing

When a buff is applied, all the calculations in the child properties have their variables frozen to their values at the time the buff is applied. You can prevent this behavior for the whole buff by using the `don't freeze variables` option, or on an individual variable reference by prefixing the variable with the keyword `$target.`.

For example, if a character has 10 strength and 16 dexterity, and applies a buff with some child property containing the calculation `$target.strength + dexterity` the property's calculation will become `strength + 16` when it is copied to the target character.

---

### Name

The name of the buff.

### Description

Description of the applied buff.

Allows [inline calculations](/docs/inline-calculations).

### Target

- **Target** Apply the buff to the target of the action
- **Self** Apply the buff to the creature taking the action

### Hide remove button

If this is set, the remove button next to the buff on the stats page will be hidden. Use this when you expect the buff to be removed automatically by another action.

### Don't show in log

If set, the buff will not show its name and description in the log when applied.

### Don't freeze variables

Prevent the buff from freezing variables in child property calculations to their value at the time the buff was applied.

### Tags

See [Tags](/docs/tags)
