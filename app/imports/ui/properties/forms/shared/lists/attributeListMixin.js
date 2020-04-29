import createListOfProperties from '/imports/ui/properties/forms/shared/lists/createListOfProperties.js';

const attributeListMixin = {
  meteor: {
    attributeList(){
      return createListOfProperties({type: 'attribute'});
    },
  },
};

export default attributeListMixin;
