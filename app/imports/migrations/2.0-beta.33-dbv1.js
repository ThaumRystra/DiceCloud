import { Migrations } from 'meteor/percolate:migrations';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { get, merge } from 'lodash';

// Git version 2.0-beta.33
// Database version 1
Migrations.add({
  version: 1,
  name: 'Unifies calculated field schema',
  up(){
    CreatureProperties.find({}).forEach(prop => {
      const modifier = getUpPropModifier(prop);
      if (!modifier) return;
      updateOrStoreError(CreatureProperties, prop, modifier);
    });
  },
  down(){
    CreatureProperties.find({}).forEach(prop => {
      const modifier = getDownPropModifier(prop);
      if (!modifier) return;
      updateOrStoreError(CreatureProperties, prop, modifier);
    });
  },
});

function updateOrStoreError(collection, prop, modifier){
  try {
    collection.update(prop._id, modifier, {
      bypassCollection2: true,
      //selector: {type: prop.type},
    });
  } catch(e){
    let errorString = e.toString();
    if (errorString){
      console.warn(errorString, prop._id);
      collection.update(prop._id, {
        $set: {_migrationError: e.toString()}
      }, {
        bypassCollection2: true,
      });
    }
  }
}

function getUpPropModifier(prop){
  const modifiers = typeUpModifiers[prop.type]?.(prop);
  if (!modifiers) return;
  return cleanModifier(merge(...modifiers));
}

function getDownPropModifier(prop){
  const modifiers = typeDownModifiers[prop.type]?.(prop);
  if (!modifiers) return;
  return cleanModifier(merge(...modifiers));
}

function cleanModifier(modifier){
  if (modifier.$set && !Object.keys(modifier.$set).length){
    delete modifier.$set;
  }
  if (modifier.$unset && !Object.keys(modifier.$unset).length){
    delete modifier.$unset;
  }
  if (!modifier.$set && !modifier.$unset) return;
  return modifier;
}

const typeUpModifiers = {
  action(prop){
    return [
      convertComputedField(prop, 'uses'),
      // TODO: This doesn't work on itemsConsumed because it is an array field
      // Need to iterate over every item consumed
      convertComputedField(prop, 'resources.itemsConsumed.quantity'),
      convertComputedField(prop, 'resources.attributesConsumed.quantity'),
      convertInlineComputationField(prop, 'summary'),
      convertInlineComputationField(prop, 'description'),
    ];
  },
};

const typeDownModifiers = {
  action(prop){
    const modifiers = [
      unConvertComputedField(prop, 'uses'),
      unConvertComputedField(prop, 'resources.itemsConsumed.quantity'),
      unConvertComputedField(prop, 'resources.attributesConsumed.quantity'),
      unConvertInlineComputationField(prop, 'summary'),
      unConvertInlineComputationField(prop, 'description'),
    ];
    return modifiers;
  },
};

function convertComputedField(object, field){
  const calculation = get(object, field);
  if (!calculation) return {
    $unset: {
      [field]: 1,
      [field + 'Errors']: 1,
      [field + 'Result']: 1,
    }
  };
  const errors = get(object, field + 'Errors');
  let value = get(object, field + 'Result');
  // If the calculation can be cast to number, use that for value
  if (value === undefined && Number.isFinite(+calculation)){
    value = +calculation;
  }
  const modifier = {
    $unset:{
      [field + 'Errors']: 1,
      [field + 'Result']: 1,
    },
    $set: {
      [field]: {
        value,
        calculation,
        errors,
      }
    }
  };
  return modifier;
}

function unConvertComputedField(object, field){
  const calculation = get(object, field)?.calculation;
  if (!calculation) return {
    $unset: {
      [field]: 1,
    }
  };
  const errors = get(object, field).errors;
  let value = get(object, field).value;
  // If the calculation can be cast to number, use that for value
  if (value === undefined && Number.isFinite(+calculation)){
    value = +calculation;
  }
  const modifier = {
    $set:{
      [field]: calculation,
      [field + 'Errors']: errors,
      [field + 'Result']: value,
    },
  };
  return modifier;
}

function convertInlineComputationField(object, field){
  const text = get(object, field);
  const inlineCalculations = get(object, field + 'Calculations');
  if (inlineCalculations){
    inlineCalculations.forEach(calc => {
      calc.value = calc.result;
      delete calc.result;
    });
  }
  return {
    $unset: {
      [field + 'Calculations']: 1,
    },
    $set: {
      [field]: {
        text,
        inlineCalculations,
      }
    },
  };
}

function unConvertInlineComputationField(object, field){
  const text = get(object, field)?.text;
  const inlineCalculations = get(object, field)?.inlineCalculations;
  if (inlineCalculations) {
    inlineCalculations.forEach(calc => {
      calc.result = calc.value;
      delete calc.value;
    });
  }
  return {
    $set: {
      [field]: text,
      [field + 'Calculations']: inlineCalculations,
    },
  };
}
