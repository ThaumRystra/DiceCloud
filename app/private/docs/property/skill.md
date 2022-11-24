# Skills

Skills represent things the creature can be proficient in. Skills can have their values or behavior modified by [effects](/docs/property/effect), and their proficiencies modified by [proficiencies](/docs/property/proficiency).

---

### Name

The name of the skill.

### Variable name

The name used to refer to the skill in calculations and by effects. Must start with a letter and be made up of only letters and numbers without spaces, symbols, or punctiation.

### Ability

The ability score that is the basis for checks made with this skill

### Type

- **Skill** Regular skills like *Athletics*, *Sleight* of Hand
- **Save** Saving throws like *Strength*, *Charisma*
- **Check** Checks that aren't skill like *Initiative*
- **Tool** Tool proficiencies
- **Weapon** Weapon proficiencies
- **Armor** Armor proficiencies
- **Language** Language proficiencies
- **Utility** Skills that don't show on the charcater sheet but can be used in calculations

### Description

A detailed description of the skill.

Allows [inline calculations](/docs/inline-calculations).

### Tags

See [Tags](/docs/tags)

### Base value

A [computed field](/docs/computed-fields) that determines the starting value of the skill before it is modified by effects and other properties. Multiple properties can set the base value for a given variable name, when this happens the highest base value is chosen, and then all other effects are applied.

### Base proficiency

The starting proficiency of the skill.
