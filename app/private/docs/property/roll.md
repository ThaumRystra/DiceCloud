# Rolls

Rolls are properties that store the result of a calculation to a variable name when applied by an [action](/docs/property/action). The variable name only exists for the duration of that particalar action.

Rolls can be useful if you need to deal the same damage to multiple targets, or if damage needs to be rolled then halved by succeeding on a saving throw.

---

### Name

Name of the roll. This will be shown in the log when the roll is applied.

### Variable name

The variable name to store the result of the roll for the duration of the action. Must start with a letter and be made up of only letters and numbers without spaces, symbols, or punctiation.

### Roll

A [computed field](/docs/computed-fields) that is computed when the roll is applied by an action.

### Don't show in log

If set, the roll will be applied and store its result in the variable name, but not be shown in the log.

### Tags

See [Tags](/docs/tags)
