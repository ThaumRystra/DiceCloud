# Constants

Constants are properties that store some primitive value in a variable name for use in other calculations.

Unlike attributes, constants can store more than just numbers:

- Arrays: `[1,2,3,4]`
- Text strings: `'I am a cat'`
- Numbers: `3.14`
- Boolean values: `true`, `false`
- Dice rolls: `1d20 + 2`

Constants just can't use other variables in their calculations.

### Overriding constants

If multiple constants have the same variable name, only the last active constant in the [character tree](/docs/tree) will be used as the definition for that variable name.

This can be used to re-write the value of some constant by ensuring there is a new active constant later in the sheet.

---

### Name

The name of the constants

### Variable Name

The name used to refer to the constant in calculations. Must start with a letter and be made up of only letters and numbers without spaces, symbols, or punctiation.

### Value

A [calculation](/docs/computed-fields) of the final value of the constant.
