import createListOfProperties from '/imports/ui/properties/forms/shared/lists/createListOfProperties.js'

const saveListMixin = {
  meteor: {
    saveList(){
      return createListOfProperties({type: 'skill', skillType: 'save'});
    },
  },
};

export default saveListMixin;
