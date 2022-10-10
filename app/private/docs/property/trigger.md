# Triggers

Triggers apply their children whenever their condition is met. They work like [actions](/docs/property/action) that are taken automatically.

---

### Name

The name of the trigger.

### Timing

- **Before** The trigger is applied before the triggering event takes place
- **After** The trigger is fired after the triggering event

### Event

- **Do action** While the creature is doing an action, the action property specified in *Event type* is applied
- **Roll check** The creature makes a check
- **Attribute damaged or healed** One of the creature's attributes changed value through attribute damage or manual adjustment
- **Short or long rest**
- **Short rest**
- **Long Rest**

### Event type

The trigger will apply when this property type is applied by the action

### Tags required

If this trigger is fired by a property, the property must match these tags for the trigger to fire.

### Condition

A [computed field](/docs/computed-fields) to determine if the trigger should fire. The trigger will fire if the condition field is empty or if it returns `true` or a value that isn't 0.

### Description

A detailed description of the trigger.

Allows [inline calculations](/docs/inline-calculations).

### Tags

See [Tags](/docs/tags)

### Don't show in log

When this is true, the trigger does not show up in the log. This does not stop the trigger's children from appearing in the log when they are applied.
