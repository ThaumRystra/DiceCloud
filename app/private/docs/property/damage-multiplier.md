# Damage multipliers

Damage multipliers are used to define vulnerability, resistance, and immunity to damage types.

A single multiplier can apply to multiple damage types, and choose whether or not to apply to an incoming source of damage based on the tags present on that damage.

---

### Name

The name of the feature that gives this damage multiplier

### Value

- **Immunity** The creature takes no damage from matching damage sources
- **Resistance** Damage from matching sources is halved.
- **Vulnerability** Damage from matching sources is doubled.

### Damage types

A list of damage types that this property applies to. Custom types can be used.

### Damage tags required

This damage multiplier will only be applied if the incoming damage has all of these tags present.

### Damage tags excluded

This damage multiplier will only apply if the incoming damage has none of these tags present.

### Tags

See [Tags](/docs/tags)
