# Dependency loops

When a variable is referenced in a calculation, that calculation can be said to depend on that variable. In order for the calculation to compute, the value of the variable needs to be known.

But consider the following property values that could be added to a creature

- The creature's Strength base value is set to `dexterity + 1` so that it will always have 1 more strength than dexterity
- The creature's Dexterity base value is set to `constitution + 1` so that it will always have 1 more dexterity than constitution
- The creature's Constitution base value is set to `strength` so that its constitution is always equal to its strength

It is not possible to resolve these calculations, not just because no values exist which satisfy the constraints, but because strength depends on dexterity which depends on constitution which depends on strength. None can be computed before the others have finalized their values. This is a dependency loop.

Most dependency loops that appear in actual DiceCloud creatures are less trivial than this example, but they cause the same result: a sheet that can't be accurately computed. In these cases, DiceCloud does its best, chooses an order to resolve the calculations arbitrarily, and continues calculating. An error will show on the Build tab to let you know that something went wrong.

![dependency loop example](/images/docs/dependency-loop.png)

## Toggles

Calculated [Toggles](/docs/property/toggle) are the main source of dependency loops on creatures, because they create a dependency that isn't as obvious as a calculation might be. When a toggle is in calculated mode, its children do not know whether they are active or not until the calulation is resolved. Because of this, every calculation under the toggle depends on the toggles calaculation, making the chance for a loop to be formed more likely the more children are under a toggle.

Consider this example

- A calculated toggle that is active if `strength < 10`
- An effect under that toggle that adds 2 to `strength`

The effect can't compute, because it does not know if it is active yet, so the toggle must compute its calculation first. The toggle needs to know if `strength` is greater than 10. Strength depends on all of the effects targeting it, it must know if the +2 effect is active or not. This creates a dependency loop, because there is no valid order in which everything can be calculated.

## Troubleshooting a dependency loop

- First, identify all the properties that make up the dependency loop. These are linked in the depdency loop error message. The field names in square brackets after the property name indicates which calculations on the property are directly involved.
- Move any properties in the loop out from being children of calculated Toggles
- Use static values in place of variables where they are not stricly needed
- Ask for [help](/feedback)
