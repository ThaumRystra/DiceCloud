<template lang="html">
  <div class="trigger-viewer">
    <v-row dense>
      <property-field
        :name="$t('TriggerForm.9ynLx9unJDKhHC_H8HtuQ')"
        :value="timingText"
      />
      <property-field
        :name="$t('ActionForm.3ylc2njgCKwqOiWNQLFrF')"
        :value="eventText"
      />
      <property-field
        :name="$t('TriggerForm.F5P5mtqa7m0WJCf_h_p7i')"
        :value="actionPropertyText"
      />
      <property-field
        v-if="(model.targetTags && model.targetTags.length) || (model.extraTags && model.extraTags.length)"
        :name="$t('TagTargeting.o5IUFxjQjJTcdzzuShiuT')"
        :cols="{cols: 12}"
      >
        <div>
          <property-tags :tags="model.targetTags" />
          <div
            v-for="tags in model.extraTags"
            :key="tags._id"
          >
            <div class="text-caption">
              {{ tags.operation }}
            </div>
            <property-tags :tags="tags.tags" />
          </div>
        </div>
      </property-field>
      <property-description
        :name="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
        :model="model.description"
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
