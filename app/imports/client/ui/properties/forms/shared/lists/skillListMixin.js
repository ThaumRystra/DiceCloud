import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties'

const skillListMixin = {
  meteor: {
    skillList() {
      return createListOfProperties({ type: 'skill' });
    },
  },
};

export default skillListMixin;
