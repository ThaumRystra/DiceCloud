import { isEqual, forOwn } from 'lodash';
import { ComputedOnlySkilLSchema } from '/imports/api/properties/Skills.js';

export default function logAlterations(memo){
  forOwn(memo.originalPropsById, old => {
    let changed = memo.propsById[old._id];
    delete changed.computationDetails;

    if (!isEqual(old, changed)){
      console.log({change: {old, changed}})
    }
  });
}

// TODO use this as a starting point to write only computed fields that have
// changed
