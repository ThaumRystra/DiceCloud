# Spell lists

Spell lists are collections of [spells](/docs/property/spell).

---

### Name

The name of the spell list.

### Description

A detailed description of the spell list.

Allows [inline calculations](/docs/inline-calculations).

### Maximum prepared spells

A [computed field](/docs/computed-fields) that determines how many spells can be considered ready to cast in this spell list.

### Spell casting ability

The spellcasting ablity for this spell list. The variable name of the ability can be accessed using `#spellList.ability` and the ability modifier with `#spellList.abilityMod`. Setting this field will automatically update Spell save DC and Attack roll bonus if they aren't set manually.

### Spell save DC

A [computed field](/docs/computed-fields) that determines the DC of saving throws in this spell list. Spells can access the DC of their spell list using `#spellList.dc`

### Attack roll bonus

A [computed field](/docs/computed-fields) that determines the bonus to add to a d20 when making a spell attack with a spell in this spell list. Spells can access the attack roll bonus of their spell list using `#spellList.attackRollBonus`

### Tags

See [Tags](/docs/tags)
