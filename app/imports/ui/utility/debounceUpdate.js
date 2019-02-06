/*
 * Creates a function that takes an object which represents the updates to be
 * made as key: value pairs. The function collects these updates, (overwriting
 * duplicates), and runs the given callback with the collated updates after the
 * `time` has passed without the function being called.
 */
export default function debounceUpdate(callback, time = 300){
  let collatedUpdate = {};
  let interval;

  return (update, ...rest) => {
    // Every time we're called, collect the update
    for (key in update){
      collatedUpdate[key] = update[key];
    }
    // Reset the clock and set it again to run the callback
    clearTimeout(interval);
    interval = setTimeout(() => {
      // Clock timed out, apply all the collated updates
      callback(collatedUpdate, ...rest);
      // Reset the collation
      collatedUpdate = {};
    }, time);
  };
};

// Example use
//
// let f = update => {
//  console.log({wroteUpdate: update});
// };
// let df = debounceUpdate(f, 300);
// df({name: 'john'});
// df({name: 'jack'});
// df({age: 24, country: 'Ethiopia'});
// df({transport: 'bus'});
//
// --> { wroteUpdate: {
//       name: 'jack',
//       age: 24,
//       country: 'Ethiopia',
//       transport: 'bus'
//     }}
