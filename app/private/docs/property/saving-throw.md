# Saving throws

Saving throws are properties that cause the target to make a saving throw when applied. If you want to add a type of saving throw like Strength Save to a creature, use a [skill](/docs/property/skill) instead.

When a saving throw is applied, the following variables are added to the scope of that action:

- `$saveFailed` Set to `true` if the target failed its saving throw or there are no targets for the saving throw
- `$saveSucceeded` Set to `true` if the target made its saving throw or there are no targets for the saving throw
- `$saveDiceRoll` The unmodified d20 roll the target made to save
- `$saveRoll` The final value of the saving throw roll after modifiers

### Name

The name of the saving throw. Usually the ability saving throw targeted: "Strength Save".

### DC

The DC of the saving throw that the target needs to meet

### Save

The variable name of the skill that will be used to make the saving throw.

### Target

- **Target** Apply the saving throw to the targets of the action. Each target will make the saving throw in turn. Child properties will be applied to each target separately with the results of their individual saving throw. If a value like damage needs to be shared between targets, it should be calculated in a [Roll](/docs/property/roll) before the saving throw.
- **Self** Apply the saving throw to the creature taking the action. The creature taking the action will become the target for all child properties.

### Tags

See [Tags](/docs/tags)

### Don't show in log

If set, the saving throw will not show in the log when applied, but will still be rolled and apply its children.
