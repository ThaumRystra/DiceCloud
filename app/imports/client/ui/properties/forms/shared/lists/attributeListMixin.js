import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';

const attributeListMixin = {
  meteor: {
    attributeList() {
      return createListOfProperties({ type: { $in: ['attribute', 'skill'] } });
    },
  },
};

export default attributeListMixin;
