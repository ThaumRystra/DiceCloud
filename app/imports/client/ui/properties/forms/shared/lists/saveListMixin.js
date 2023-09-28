import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties'

const saveListMixin = {
  meteor: {
    saveList() {
      return createListOfProperties({ type: 'skill', skillType: 'save' });
    },
  },
};

export default saveListMixin;
