<script setup lang="ts">
import { computed, inject } from 'vue';
import { timingOptions, eventOptions, actionPropertyTypeOptions } from '/imports/api/properties/Triggers';

const props = defineProps<{ model: Record<string, any> }>();
const context = inject<any>('context', {});

const timingText = computed(() => {
  if (!props.model.timing) return undefined;
  return timingOptions[props.model.timing];
});

const actionPropertyText = computed(() => {
  if (!props.model.actionPropertyType) return undefined;
  return actionPropertyTypeOptions[props.model.actionPropertyType];
});

const eventText = computed(() => {
  if (!props.model.event) return undefined;
  return eventOptions[props.model.event];
});
</script>

<template lang="html">
  <div class="trigger-viewer">
    <v-row dense>
      <property-field
        name="Timing"
        :value="timingText"
      />
      <property-field
        name="Event"
        :value="eventText"
      />
      <property-field
        name="Event Type"
        :value="actionPropertyText"
      />
      <property-field
        v-if="(model.targetTags && model.targetTags.length) || (model.extraTags && model.extraTags.length)"
        name="Tags Required"
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
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>
