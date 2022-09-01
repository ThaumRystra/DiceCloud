# Actions

Actions are things your character can do. When an action is taken, all the properties under it are applied.

Add actions to your character sheet, then add children under the action to determine what happenes when the action is applied.

When an action is applied it will create an entry in the character's log detailing all the properties that were applied and what their results were.

The following properties can all be applied by an action: 

  - [Attribute Damage](/docs/property/attribute-damage)
  - [Branches](/docs/property/branch)
  - [Buffs](/docs/property/buff)
  - [Buff Removers](/docs/property/remove-buff)
  - [Damage](/docs/property/damage)
  - [Notes](/docs/property/note)
  - [Rolls](/docs/property/roll)
  - [Saving Throws](/docs/property/saving-throw)
  - Other actions

---

### Name

The name of the action.

### Action type

How long the action takes to perform.

Allows [inline calculations](/docs/inline-calculations).

### Attack roll

A [computed field](/docs/computed-fields) which calculates the attack roll modifier. If this field is empty, no attack roll will be made. Use 0 to make an attack roll without a modifier.

The following variables may be added to the action scope when attack rolls are made:

  - `$attackDiceRoll` The value of the d20 roll before any modifiers were applied.
  - `$attackRoll` The total attack roll after modifiers.
  - `$criticalHit` Set to `true` if the attack roll's d20 is a natural 20. If `criticalHitTarget` is set, the attack roll's d20 must instead be equal to or greater than `criticalHitTarget` for this to be set to `true`.
  - `$criticalMiss` Set to `true` if the attack roll was not a critical hit and rolled a natural 1 on the d20 roll.
  - `$attackHit` If the attack roll is higher than or equal to the target's AC or a critical hit this is set to `true`. Remains unset if there is no target for the attack unless the attack is a critical hit.
  - `$attackMiss` If the attack roll is lower than the target's AC or a critical miss, this is set to `true`. Remains unset if there is no target for the attack unless the attack is a critical miss.

### Summary

A brief overview of what the action does. This will appear in the action card, and shows in the log when the action is applied.

Allows [inline calculations](/docs/inline-calculations).

### Description

A more detailed description of the action. The description does not show in the action card or the log when the action is applied.

Allows [inline calculations](/docs/inline-calculations).

### Resource

A resource can be any attribute that has a variable name. If the resource attribute is less than the amount required, the action can't be applied.

If you want to reduce an attribute when taking the action, but want the action to be applied regardless of the value of that attribute, consider using an [Attribute Damage](/docs/property/attribute-damage) property as a child of the action instead. Also use Attribute Damage when the amount to reduce the attribute is determined by a dice roll rather than a stable computed number.

#### Resource attribute

The variable name of the attribute that will be consumed when taking this action.

#### Resource quantity

A [computed field](/docs/computed-fields) which determines how much of the attribute is required to apply this action. This amount will be deducted from the attribute every time the action is taken.

### Ammo

Ammo represents items that are requied to take the action. If an item is not selected, or there is insufficient quantity of the selected item, the action can't be appled.

#### Ammo item

Specify what tag an item must have to be considered valid ammo for this action. Any item with this tag can be selected as ammo for this action.

#### Ammo quantity

A [computed field](/docs/computed-fields) which determines how many of the selected items are required to take this action. The quantity is deducted from the total quantity of the item when this action is applied.

### Tags

See [Tags](/docs/tags)

### Target

Who this action should apply to. The properties under the action will be applied to the Targets.

- **Self** The action will apply its properties to the creature taking the action
- **Single Target** The action will apply its properties without a target (for now)
- **Multiple Targets** The action will apply its properties without a target (for now)

### Uses

A [computed field](/docs/computed-fields) which determines how many times this action can be used before it needs to be reset.

### Uses used

How many of this action's uses have already been used. Should ideally be between 0 and the total uses available. This number is set to 0 when the action has uses and its uses are reset.

### Don't show in log

When this is true, the action does not show up in the log. This does not stop the action's children from appearing in the log when they are applied.

### Reset

If set, the uses used field is set to 0 at the appropriate time.

- **Long rest** Reset when the long rest button is pushed
- **Short rest** Reset when either the long or short rest button is pushed
