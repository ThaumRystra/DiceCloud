# Branches

Branches are applied by actions, when they are applied they can control which of their immediate children are applied.

---

### Branch type

- **If condition is true** Apply children if the condition (a [computed field](/docs/computed-fields)) resolves to `true` or a non-zero number
- **Attack hit** Apply children if the attack roll hit the target
- **Attack hit** Apply children if the attack roll missed the target
- **Save failed** Apply children if target failed its saving throw
- **Save suceeded** Apply children if target made its saving throw
- **Apply to each target** Apply children separately to each target
- **Random** Apply one of the immediate children at random
- **Calculated Index** Use the index (a [computed field](/docs/computed-fields)) to choose which child to apply, starting at 1 for the first child.

### Tags

See [Tags](/docs/tags)

### Don't show in log

When this is set, the branch is applied, but does not show in the log. This does not prevent its children from appearing in the log.
