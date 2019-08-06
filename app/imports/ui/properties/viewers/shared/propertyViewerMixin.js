import PropertyName from '/imports/ui/properties/viewers/shared/PropertyName.vue';
import PropertyVariableName from '/imports/ui/properties/viewers/shared/PropertyVariableName.vue';
import PropertyField from '/imports/ui/properties/viewers/shared/PropertyField.vue';
import PropertyDescription from '/imports/ui/properties/viewers/shared/PropertyDescription.vue';

const propertyViewerMixin = {
  components: {
    PropertyName,
    PropertyVariableName,
    PropertyField,
    PropertyDescription,
  },
  props: {
		model: {
			type: Object,
			required: true,
		},
	},
};

export default propertyViewerMixin;
