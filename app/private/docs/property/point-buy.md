# Point buy

A point buy is a set of rows that lets the user choose a set of stats based on a cost per stat.

---

### Table name

The name of the point buy table.

### Min

The lowest value available for each row

### Max

The highest value available for each row

### Cost

A function that uses `value` as the value of a row and determines the cost of that value. For standard D&D 5e 27 point buy, this function is `[0, 1, 2, 3, 4, 5, 7, 9][value - 7]`

### Total available points

A [computed field](/docs/computed-fields) that determines how many points are available to spend in total

## Rows

Up to 32 rows can be added to a point buy table

### Row name

The name of the row that will appear in the table

### Row variable name

The variable name of the row that can be used in calculations. Must start with a letter and be made up of only letters and numbers without spaces, symbols, or punctiation.

If the variable name matches an attribute with the same variable name, the row's value will be used as a base value for that attribute.
