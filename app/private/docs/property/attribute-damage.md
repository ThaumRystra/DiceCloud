# Attribute Damage

When applied, attribute damage reduces the value of the attribute by some amount or set the value of an attribute to some amount. Attribute damage can by applied by actions or triggers.

Using a negative value to damage an attribute will heal the attribute instead.

---

### Attribute

The variable name of the attribute to target.

### Amount

A [computed field](/docs/computed-fields) which determined the amount to damage the attribute or set the attribute's value to.

### Operation

- **Damage** Reduce the value of the attribute by the amount, negative values heal the attribute instead
- **Set** Set the value of the attribute to the amount

### Target

- **Target** Apply the attribute damage to the same target as the action applying this property
- **Self** Apply the attribute damage to the creature taking the action

### Tags

See [Tags](/docs/tags)

### Don't show in log

When this is set, the attribute damage is applied, but does not show in the log.
