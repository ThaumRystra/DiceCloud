# Items

Items are shown on the Inventory tab. Items can be carried, put in containers, or equipped on a creature. The children of an item are not active unless the item is equipped.

---

### Icon

An icon representing the item.

### Equipped

If set, the item appears in the equipment list on the inventory tab and its children become active on the creature.

### Name

The name of the item.

### Plural name

The name to use if the quantity of the item is higher than 1.

### Value

The value of a single item in gold pieces. Silver pieces are worth 0.1 gp and copper pieces are worth 0.01 gp. So an item that is worth 2 gp 4 sp 7 cp will have a value of  2.47 gp.

### Weight

The weight of a single item in lb.

### Quantity

Number of items. The value and quantity will be multiplied by the quantity to get the total value and weight of this stack of items.

### Description

A description of the item. 

Allows [inline calculations](/docs/inline-calculations).

### Tags

See [Tags](/docs/tags)

### Show increment button

If this is set, the item will show an increment button in the detail view and on the inventory tab. This button can be used to quickly adjust the quantity of the item.

### Requires attunemnt

If set, the item requires attunemnt to use.

### Attuned

If set, the item is attuned and counts towards the total number of attuned items for the creature.

If a child property needs to determine if its parent item is attuned it can use `#item.attuned` in calculations, see *Ancestor references* in [computed fields](/docs/computed-fields).
