<template lang="html">
  <div class="toggle-viewer">
    <v-row dense>
      <property-field
        name="Variable Name"
        mono
        :value="model.variableName"
      />
      <property-field
        v-if="model.disabled || model.enabled"
        name="State"
        :value="model.enabled ? 'Enabled' : 'Disabled'"
      />
      <template v-else-if="model.condition">
        <property-field
          name="Condition"
          :calculation="model.condition"
        />
        <property-target-tags
          :model="model"
        />
      </template>
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
import PropertyTargetTags from '/imports/client/ui/properties/viewers/shared/PropertyTargetTags.vue';

export default {
  components: {
    PropertyTargetTags,
  },
  mixins: [propertyViewerMixin],
}
</script>
