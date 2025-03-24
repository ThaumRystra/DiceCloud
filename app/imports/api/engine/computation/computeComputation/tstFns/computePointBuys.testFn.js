import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import propsFromForest from '/imports/api/engine/computation/utility/propsFromForest.testFn';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  await computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];
  assert.equal(prop('strengthId').value, 11, 'Point buys should apply a base value when active');
}

var testProperties = propsFromForest([
  {
    _id: 'strengthId',
    variableName: 'strength',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '8'
    },
  }, {
    // calculated inactive toggle with point buy under it
    // It should not impact the ability score
    type: 'toggle',
    condition: { calculation: 'false' },
    children: [
      {
        _id: 'inactivePointBuy',
        type: 'pointBuy',
        values: [{ variableName: 'strength', value: 13 }],
      }
    ]
  }, {
    type: 'pointBuy',
    values: [{ variableName: 'strength', value: 11 }],
  }
]);
