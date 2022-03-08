import SimpleSchema from 'simpl-schema';
import { set } from 'lodash';

set(Meteor.settings,
  'packages.collection2.disableCollectionNamesInValidation',
  true);

SimpleSchema.extendOptions([
  'parseLevel',
  'removeBeforeCompute',
  'inlineCalculationField',
  'computedField',
]);

// Store a quick way of referencing keys that have specific tags === true
function storeTaggedKeys(tag, fnName){
  SimpleSchema.prototype[fnName] = function(){
    if (!this['_' + fnName]){
      this['_' + fnName] = [];
      for (const key in this._schema){
        if (this._schema[key][tag]){
          this['_' + fnName].push(key);
        }
      }
    }
    return this['_' + fnName];
  }
}

// Keys that should be deleted at the start of a computation
storeTaggedKeys('removeBeforeCompute', 'removeBeforeComputeFields');
// Keys that represent inline calculation objects
storeTaggedKeys('inlineCalculationField', 'inlineCalculationFields');
// Keys that represent computed field objects
storeTaggedKeys('computedField', 'computedFields');
