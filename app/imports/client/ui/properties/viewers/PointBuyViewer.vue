<template lang="html">
  <div class="point-buy-viewer">
    <v-row dense>
      <property-field
        v-for="(row, i) in model.values"
        :key="row._id"
        :name="row.name"
        :value="row.value"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
import { getPropertyName } from '/imports/constants/PROPERTIES';
import { timingOptions, eventOptions, actionPropertyTypeOptions } from '/imports/api/properties/Triggers';

export default {
  mixins: [propertyViewerMixin],
  inject: {
    context: {
      default: {},
    },
  },
  computed: {
    slotTypeName(){
      if (!this.model.slotType) return;
      return getPropertyName(this.model.slotType);
    },
    timingText(){
      if (!this.model.timing) return;
      return timingOptions[this.model.timing];
    },
    actionPropertyText(){
      if (!this.model.actionPropertyType) return;
      return actionPropertyTypeOptions[this.model.actionPropertyType];
    },
    eventText(){
      if (!this.model.event) return;
      return eventOptions[this.model.event];
    },
  }
}
</script>
