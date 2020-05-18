import PROPERTIES from '/imports/constants/PROPERTIES.js';
import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';

export default {
  components: {
    PropertyIcon,
  },
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
    selected: Boolean,
  },
  computed: {
    title(){
      let model = this.model;
      if (!model) return;
      if (model.name) return model.name;
      let prop = PROPERTIES[model.type]
      return prop && prop.name;
    }
  }
}
