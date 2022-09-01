# Spells

Spells work similarly to [actions](/docs/property/action). They appear on the spells tab and can be cast with or without using up spell slots.

---

### Always prepared

A spell that is always prepared does not count towards the spell list's maximum prepared spells and is always active and ready to cast.

### Prepared

A prepared spell is ready to cast and counts against a spell list's maximum prepared spells.

### Cast without spell slots

When set, this spell can be cast without consuming spell slots. It will however consume its own uses and resources.

### School

What school the spell belongs to.

### Casting time

How long the spell takes to Cast

### Range

The range of the spell

### Duration

How long the spell lasts

### Components

Whether the spell requires verbal, somatic, or material components and whether the spell is a ritual or requires concentration.

### Target

Who this spell should apply to. The properties under the spell will be applied to the targets.

- **Self** The spell will apply its properties to the creature casting the spell
- **Single Target** The spell will apply its properties without a target (for now)
- **Multiple Targets** The spell will apply its properties without a target (for now)

### Attack roll

A [computed field](/docs/computed-fields) which calculates the spell attack roll modifier. If this field is empty, no attack roll will be made. Use 0 to make an attack roll without a modifier. To use the spell list's attack roll bonus use `#spellList.attackRollBonus`.

The following variables may be added to the action scope when attack rolls are made:

  - `$attackDiceRoll` The value of the d20 roll before any modifiers were applied.
  - `$attackRoll` The total attack roll after modifiers.
  - `$criticalHit` Set to `true` if the attack roll's d20 is a natural 20. If `criticalHitTarget` is set, the attack roll's d20 must instead be equal to or greater than `criticalHitTarget` for this to be set to `true`.
  - `$criticalMiss` Set to `true` if the attack roll was not a critical hit and rolled a natural 1 on the d20 roll.
  - `$attackHit` If the attack roll is higher than or equal to the target's AC or a critical hit this is set to `true`. Remains unset if there is no target for the attack unless the attack is a critical hit.
  - `$attackMiss` If the attack roll is lower than the target's AC or a critical miss, this is set to `true`. Remains unset if there is no target for the attack unless the attack is a critical miss.

### Summary

A brief overview of what the spell does. This will show in the log when the spell is cast.

Allows [inline calculations](/docs/inline-calculations).

### Description

A more detailed description of the spell. The description does not show in the log when the spell is cast.

Allows [inline calculations](/docs/inline-calculations).

### Resource

A resource can be any attribute that has a variable name. If the resource attribute is less than the amount required, the spell can't be cast.

If you want to reduce an attribute when casting the spell, but want the spell to be applied regardless of the value of that attribute, consider using an [Attribute Damage](/docs/property/attribute-damage) property as a child of the spell instead. Also use Attribute Damage when the amount to reduce the attribute is determined by a dice roll rather than a stable computed number.

#### Resource attribute

The variable name of the attribute that will be consumed when casting this spell.

#### Resource quantity

A [computed field](/docs/computed-fields) which determines how much of the attribute is required to apply this spell. This amount will be deducted from the attribute every time the spell is cast
### Ammo

Ammo represents items that are requied to cast the spell. If an item is not selected, or there is insufficient quantity of the selected item, the spell can't be appled.

#### Ammo item

Specify what tag an item must have to be considered valid ammo for this spell. Any item with this tag can be selected as ammo for this spell.

#### Ammo quantity

A [computed field](/docs/computed-fields) which determines how many of the selected items are required to cast this spell. The quantity is deducted from the total quantity of the item when this spell is applied.

### Uses

A [computed field](/docs/computed-fields) which determines how many times this spell can be used before it needs to be reset.

### Uses used

How many of this spell's uses have already been used. Should ideally be between 0 and the total uses available. This number is set to 0 when the spell has uses and its uses are reset.

### Reset

If set, the uses used field is set to 0 at the appropriate time.

- **Long rest** Reset when the long rest button is pushed
- **Short rest** Reset when either the long or short rest button is pushed


### Tags

See [Tags](/docs/tags)