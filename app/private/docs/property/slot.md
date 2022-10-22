# Slots

Slots are the main way creatures interact with libraries. A slot can be filled by choosing a property from a library that fits that particular slot.

In a complete library, a creature can be built entirely by choosing which properties to fill each slot with.

Slots show up on the build tab, and are highlighted when they have space that can be filled.

If you are building a creature without a library, you should either ignore slots entirely, or fill them with your own custom properties.

---

### Name

The name of the slot.

### Type 

What kind of property this slot expects to fill it.

### Tags required

Properties in a library must have the required tags to fill the slot.

### Quantity

How many properties are expected to fill this slot. Use 0 for allowing an unlimited number of properties.

### Condition

A [computed field](/docs/computed-fields) that determines whether this slot can accept new properties.

### Unique

The slot can control how it deals with the uniqueness of properties that fill it.

### Description

A detailed description of the attribute.

Allows [inline calculations](/docs/inline-calculations).

### Hide when full

When set the slot will hide itself when it is filled.

### Ignored

When set the slot will not show a prompt card on the build tab.

### Tags

See [Tags](/docs/tags)