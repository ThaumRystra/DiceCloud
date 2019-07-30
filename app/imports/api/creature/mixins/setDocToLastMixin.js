import SimpleSchema from 'simpl-schema';
import { setDocToLastOrder } from '/imports/api/parenting/order.js';

export function setDocToLastMixin(methodOptions){
  // Make sure the doc has a charId
  // This mixin should come before simpleSchemaMixin so that it can extend the
  // schema before it is turned into a validate function
  if (methodOptions.validate){
    throw new Meteor.Error(`setDocToLastMixin should come before simpleSchemaMixin`);
  }
  methodOptions.schema = new SimpleSchema({
    charId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).extend(methodOptions.schema);
  let collection = methodOptions.collection;
  if (!collection){
    throw new Meteor.Error("`collection` required in method options for setDocToLastMixin");
  }
  let runFunc = methodOptions.run;
  methodOptions.run = function(doc){
    setDocToLastOrder({collection, doc});
    return runFunc.apply(this, arguments);
  };
  return methodOptions;
}
