# Attribute

Attributes are the core properties of a DiceCloud creature. Each attribute represents some numerical value of the creature.

Attributes can be targeted by [effects](/docs/property/effect) which can change their total value in a non-destructive way. For example, if a class level gives you an ability score increase of +2 strength when it is taken, instead of directly editing the strength attribute, you add an effect to the class level that adds 2 to strength. The total value of strength will increase by 2 and it will show a record of that ability score increase and where it came from.

Attributes, [skills](/docs/properties/skill), and [effects](/docs/property/effect) are the core properties of DiceCloud's creature engine.

Attributes have the following fields that can be accessed in calculations with `variableName.field`:

- `.total` The total of the attribute before being damaged
- `.damage` the amount of damage the attribute has taken
- `.value` The current value of the attribute including damage. `variableName` and `variableName.value` are equivalent.
- `.modifier` If the attribute is an ability, this is its roll modifier, eg. `strength.modifier` is +2 when `strength.value` is 14

---

### Base value

This is the starting value of the attribute before it is modified by effects and other properties. Multiple properties can set the base value for a given variable name, when this happens the highest base value is chosen, and then all other effects are applied.

### Name

The name of the attribute

### Variable name

The name used to refer to the attribute in calculations and by effects. Must start with a letter and be made up of only letters and numbers without spaces, symbols, or punctiation.

If multiple attributes share a variable name, only the last attribute on the [character tree](/docs/tree) will count as the defining attribute and appear on the sheet.

### Attribute type

- **Ability** Ablity scores like Strength, Dexterity, etc. Ability scores get a modifier which can be accessed in calculations as `variableName.modifier`,
- **Stat** Any numerical value that appears on the sheet. Speed, armor class.
- **Modifier** Any numical value that appears on the sheet with a `+` or `-` sign, eg. Proficiency bonus.
- **Hit Dice** Hit dice let you select the appropriate hit dice size. Creatures regain half their total hit dice on long rest.
- **Health Bar** Health bars can by made to take or ignore damage in a specified order
- **Resource** Rages, sourcery points, things that are spent to use actions.
- **Spell Slot** Spell slots have a specific level and are used to cast spells.
- **Utility** Utility attributes don't show up anywhere on the sheet, but can still be used for calculations

### Description

A detailed description of the attribute.

Allows [inline calculations](/docs/inline-calculations).

### Health bar settings

Health bars can take or ignore damage and healing from applied damage properties targeting a creature. A lower ordered health bar will take damage before a higher ordered one.

Health bars can also change color depending on their value. At 50%+ full they are their property color, between 50% and 0% they fade from their half-full color to their empty color.

### Tags

See [Tags](/docs/tags)

### Allow decimal values

If this is set, the attribute will not round-down when its value has a decimal.

### Can be damaged into negative values

If this is set the attribute can be damaged past zero into negative values.

### Can be incremented above total

If this is set the attribute can have negative damage such that the value exceeds the total. This can be useful if you are using the attribute to count, it can start at zero and be healed upwards to keep count.

### Reset

If set, the damage on this attribute is reset to 0 at the appropriate time.

- **Long rest** Reset when the long rest button is pushed
- **Short rest** Reset when either the long or short rest button is pushed
