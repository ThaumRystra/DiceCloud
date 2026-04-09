<template lang="html">
  <toolbar-card
    :id="model._id"
    :color="model.color"
    @toolbarclick="$emit('click')"
  >
    <template #toolbar>
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer />
      <property-icon
        :model="model"
        :color="model.color"
      />
    </template>
    <v-card-text v-if="summaryText">
      <property-description
        text
        :model="model.summary"
      />
    </v-card-text>
  </toolbar-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ToolbarCard from '/imports/client/ui/components/ToolbarCard.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';

const props = defineProps<{
  model: Record<string, any>;
}>();

const summaryText = computed(() => {
  if (!props.model || !props.model.summary) return undefined;
  if (typeof props.model.summary.value === 'string') {
    return props.model.summary.value;
  } else {
    return props.model.summary.text;
  }
});
</script>

<style lang="css" scoped>
</style>
