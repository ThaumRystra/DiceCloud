const INDEX = {
  'attribute': 1,
  'pointBuy': 2,
  'base': 3,
  'add': 4,
  'mul': 5,
  'min': 6,
  'max': 7,
  'advantage': 8,
  'disadvantage': 9,
  'passiveAdd': 10,
  'fail': 11,
  'conditional': 12,
};

function sortEffects(effects) {
  if (!effects || !effects.length) return [];
  return effects.sort(
    (a, b) => (INDEX[a.operation || a.type] || 99) - (INDEX[b.operation || b.type] || 99)
  );
}

export default sortEffects;
