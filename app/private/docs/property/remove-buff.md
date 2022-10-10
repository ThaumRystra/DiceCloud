# Remove Buff

This property can remove a specific buff from a targeted creature.

### Name

The name of the property. This shows in the log when the property is applied.

### Remove parent buff

When this is set and the property is applied, the property will remove the nearest parent buff. If this property is not the child of any buffs, it will log an error.

### Remove all

When this is set, all buffs that match the target tags will be removed from the targeted creature. If not set, only the first buff found with the matching tags will be removed.

### Target

- **Target** Matching buffs will be removed from the targeted creature
- **Self** Matching buffs will be removed from the creature that applied the action

### Tags required

Any buff that has all of the required tags will be removed when the property is applied.

### Tags

See [Tags](/docs/tags)

### Don't show in log

When this is set, the property is applied, but does not show in the log. 