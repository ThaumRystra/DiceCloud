<template lang="html">
  <div class="class-viewer">
    <v-row dense>
      <property-field
        name="Variable Name"
        mono
        :value="model.variableName"
      />
      <property-field
        name="Condition"
        :value="model.slotCondition && (model.slotCondition.value || model.slotCondition.calculation)"
      />
      <property-field
        name="Tags Required"
        :cols="{cols: 12}"
      >
        <div>
          <property-tags :tags="model.slotTags" />
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
        name="Missing Levels"
        mono
        :model="model.missingLevels &&
          (model.missingLevels.length || undefined) &&
          model.missingLevels.join(', ')
        "
      />
      <property-field
        v-if="context.creatureId"
        name="Level"
        :value="model.level"
      />
      <property-field
        v-if="context.creatureId"
        name="Level Up"
        :cols="{cols: 12}"
      >
        <v-btn
          v-if="model.missingLevels && model.missingLevels.length"
          outlined
          color="accent"
        >
          <v-icon left>
            mdi-plus
          </v-icon>
          Get Missing Levels
        </v-btn>
        <v-btn
          v-else
          outlined
          color="accent"
        >
          <v-icon left>
            mdi-plus
          </v-icon>
          Level Up
        </v-btn>
      </property-field>
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';

export default {
  mixins: [propertyViewerMixin],
  inject: {
    context: {
      default: {},
    },
  },
}
</script>

<style lang="css" scoped>
</style>
