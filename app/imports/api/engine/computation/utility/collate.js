// Collate the array with the given value or array of values, creating the
// array if it doesn't exist
export default function collate(array, toAdd){
  if (Array.isArray(toAdd) && toAdd.length){
    if (!array) array = [];
    array.push(...toAdd);
  } else if (toAdd) {
    if (!array) array = [];
    array.push(toAdd);
  }
  return array;
}
