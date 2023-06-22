import ComputedField from '/imports/client/ui/properties/forms/shared/ComputedField.vue';
import InlineComputationField from '/imports/client/ui/properties/forms/shared/InlineComputationField.vue';
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';

export default {
  components: {
    ComputedField,
    InlineComputationField,
    FormSection,
    FormSections,
  },
  props: {
    model: {
      type: [Object, Array],
      default: () => ({}),
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    change(path, value, ack) {
      if (!Array.isArray(path)) {
        path = [path];
      }
      this.$emit('change', { path, value, ack });
    }
  },
}
