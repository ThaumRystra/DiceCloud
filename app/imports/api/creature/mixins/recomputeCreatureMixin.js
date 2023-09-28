import computeCreature from '/imports/api/engine/computeCreature';

export default function recomputeCreatureMixin(methodOptions) {
  let runFunc = methodOptions.run;
  methodOptions.run = function ({ charId }) {
    const result = runFunc.apply(this, arguments);
    if (
      methodOptions.skipRecompute &&
      methodOptions.skipRecompute.apply(this, arguments)
    ) {
      return result;
    }
    computeCreature(charId);
    return result;
  };
  return methodOptions;
}
