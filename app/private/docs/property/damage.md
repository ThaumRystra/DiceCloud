# Damage

Damage can be applied by an action to damage a target creature's [health bars](/docs/property/attribute). The damage will be modified by [damage multipliers](/docs/property/damage-multiplier), which apply vulnerability, resistance, and immunity before the damage is applied.

---

### Damage

A [computed field](/docs/computed-fields) that determines how much damage to do to the target creature.

### Damage type

Damage type determines how the damage is treated by [damage multipliers](/docs/property/damage-multiplier). A custom type can be used, or one of the existing types can be selected.

There are two special damage types:

**Extra damage** Damage with the `extra` type will take on the damage type of whatever damage was applied before it by an action. So if an action deals 12 `piercing` damage and `3` extra damage, it will instead deal 15 `piercing` damage.

**Healing** Damage with the `healing` type will heal a creature instead of damaging them.

### Target

- **Target** Apply the damage to the target of the action
- **Self** Apply the damage to the creature taking the action

### Tags

See [Tags](/docs/tags)

### Don't show in log

If set, the damage will be applied but not show in the log.
