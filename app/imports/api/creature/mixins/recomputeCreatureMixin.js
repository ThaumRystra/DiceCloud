import { recomputeCreatureById } from '/imports/api/creature/computation/recomputeCreature.js';

export default function recomputeCreatureMixin(methodOptions){
  let runFunc = methodOptions.run;
  methodOptions.run = function({charId}){
    const result = runFunc.apply(this, arguments);
    if (
      methodOptions.skipRecompute &&
      methodOptions.skipRecompute.apply(this, arguments)
    ) {
      return result;
    }
    recomputeCreatureById(charId);
    return result;
  };
  return methodOptions;
}
