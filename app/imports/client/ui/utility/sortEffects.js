const INDEX = {
  'base': 1,
  'add': 2,
  'mul': 3,
  'min': 4,
  'max': 5,
  'advantage': 6,
  'disadvantage': 7,
  'passiveAdd': 8,
  'fail': 9,
  'conditional': 10,
};

function sortEffects(effects){
  if (!effects || !effects.length) return [];
  return [...effects].sort(
    (a, b) => (INDEX[a.operation] || 99) - (INDEX[b.operation] || 99)
  );
}

export default sortEffects;
