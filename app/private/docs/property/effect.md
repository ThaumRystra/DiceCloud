# Effects

Effects are the core of the DiceCloud engine. Effect change the values of attributes, skills, and calculations in a way that is transparent and auditable, keeping character sheets organized and understandable, even when using intricate homebrew rules on high level characters. To understand how effects work is to understand DiceCloud characters.

---

### Name

The name of the feature that causes this effect.

### Operation

The operation determines what the effect will do to the affected property or calcualtion.

- **Base Value** Set the base value of the affected property. If a property has multiple base values, the highest is used
- **Add** Add the value to the affected property or calculation
- **Muliply** Multiply the affected property by the value
- **Minimum** Prevent the affected property from having a value less than the effect value
- **Maximum** Prevent the affected property from having a value greater than the effect value
- **Maximum** Prevent the affected property from having a value greater than the effect value
- **Set** Set the value affected property to the effect value
- **Advantage** Give advantage to checks made using the affected property
- **Disadvantage** Give disadvantage to checks made using the affected property
- **Passive bonus** Add the effect value to the passive scores based on the affected property
- **Fail** Checks made using the affected property automatically fail
- **Conditional benefit** Add some text to the affected property describing the benefit recieved

### Value

A [computed field](/docs/computed-fields) that determines the value of the effect.

### Text

If the operation is a conditional benefit, the note text that will show on affected properties.

### Target stats by variable name

If selected the effect will apply to all properties that have the given variable names.

### Variable names

A list of variable names of properties to target with this effect.

### Target properties by tags

When targeting properties by tag, any property can be targeted with an effect. If the property is one that can usually be targeted by variable name, the effect will apply as ususal, however if the effect targets another property, it will apply to a [computed field](/docs/computed-fields) on the property instead.

These effects can be used for adding a bonus to a specific attack or damage roll, or manipulating any computed field on the creature.

### Tags required

Only properties that match the required tags will be targeted by the effect.

### Target field

If a property has multiple computed fields, which field should be targeted by this effect.

### Tags

See [Tags](/docs/tags)
