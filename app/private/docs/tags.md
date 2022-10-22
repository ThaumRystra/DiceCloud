# Tags

Tags are used to reference multiple similar properties at once. A slot can require only properties from your library that has matching tags, effects and some other properties can also target properties to apply to by tags.

## Built in tags

Properties have specific tags automatically for use with tag-targeting. These aren't relevant for slots and finding properties in a library with specific tags.

- `#type` Actions will have the `#action` tag, etc. Damage will either have the tag `#damage` or the tag `#healing` if the damage type is healing
- `variableName` if a property has a variable name it will be included as a tag
- The type of damage done by a [damage](/docs/property/damage) property: `bludgeoning`, `slashing`, `...` 
- The skill type of a [skill](/docs/property/skill) property: `skill`, `save`, `check`, `tool`, `weapon`, `armor`, `language`, `utility`
- The attribute type of an [attribute](/docs/property/attribute) property: `ability`, `stat`, `modifier`, `hitDice`, `healthBar`, `resource`, `spellSlot`, `utility`
- When the property resets: `longRest`, `shortRest`
