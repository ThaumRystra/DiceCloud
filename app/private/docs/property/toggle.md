# Toggles

Toggles are a way to turn on and off parts of a creature. When a toggle is off, none of its children will be active.

Calculated toggles should be avoided if possible, because while they offer a lot of power and flexibility to the creature engine, they often create [dependency loops](/docs/dependency-loops) that can be difficult to troubleshoot, causing parts of a creature to calculate incorrectly.

Calculated toggles can be applied by [actions](/docs/property/action) and will apply their children if the condition is true, but they should be avoided in favor of [conditional branches](/docs/property/branch) which can do the same, but are more efficient.

---

### Name

The name of the toggle.

### Variable name

The name used to refer to the value of the toggle in calculations. Must start with a letter and be made up of only letters and numbers without spaces, symbols, or punctiation.

### Show on character sheet

If set, the toggle with show a checkbox on the character sheet. A calculated toggle will show a disabled checkbox, filled in if the toggle's calculation returned `true` or a value that isn't 0.

### State

- **Enabled** The toggle and its children are active
- **Disabled** The toggle and its children are inactive
- **Calculated** The active status of the toggle depends on the result of the condition. Use with caution.

### Condition

A [computed field](/docs/computed-fields) that determines if the toggle is active. Use with caution.

### Tags

See [Tags](/docs/tags)

