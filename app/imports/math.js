import { create, all } from 'mathjs';
const math = create(all);
math.import({
  'if': function(pred, a, b) {
      return pred ? a : b;
  }
});

export default math;
