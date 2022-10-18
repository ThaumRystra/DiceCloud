# Classes

A class is a property that expects [class levels](/docs/property/class-level) as its immediate children.

Leveling up a class means choosing, or manually adding, class level properties to it. Class levels with the same variable name as the class, and that match all the required tags are found in libraries and added to the class.

The total level of the class can be accessed in calculations using `classVariableName.level`.

## Making your own class

See [Create a Class](/docs/walkthroughs/create-a-class)

---

### Name

The name of the class

### Variable name

The name used to refer to the class in calculations. Must start with a letter and be made up of only letters and numbers without spaces, symbols, or punctiation.

### Description

A description of the class.

### Tags

See [Tags](/docs/tags)

### Tags required

Only class levels with the same variable name as the class, and with tags that match the tags required will be returned from libraries when leveling up this class.

### Condition

A [computed field](/docs/computed-fields) to determine if the class is allowed to level up. If this field results in `true` or a number that is not 0, the class can be levelled, otherwise leveling is disabled.
