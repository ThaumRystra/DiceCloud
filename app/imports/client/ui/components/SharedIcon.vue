<script setup lang="ts">
import { computed } from 'vue';
import { autorun } from 'vue-meteor-tracker';

const props = defineProps<{
  model: {
    owner: string;
    writers: string[];
    readers: string[];
    public?: boolean;
  };
}>();

const { result: accessRights } = autorun(() => {
  const userId = Meteor.userId();
  if (props.model.owner === userId) return 'owner';
  else if (props.model.writers.includes(userId as string)) return 'writer';
  else if (props.model.readers.includes(userId as string)) return 'reader';
  else if (props.model.public) return 'public';
  else return 'denied';
});

const accessIcon = computed(() => {
  switch (accessRights.value) {
    case 'writer': return 'mdi-file-edit';
    case 'reader': return 'mdi-file-eye';
    case 'public': return 'mdi-cloud';
    default: return '';
  }
});

const accessText = computed(() => {
  switch (accessRights.value) {
    case 'writer': return 'Shared with edit permission';
    case 'reader': return 'Shared as view-only';
    case 'public': return 'Shared publically';
    default: return '';
  }
});
</script>

<template lang="html">
  <v-tooltip
    v-if="accessRights === 'reader' || accessRights === 'writer' || accessRights === 'public'"
    location="bottom"
  >
    <template #activator="{ props }">
      <v-icon
        style="opacity: 0.4"
        v-bind="props"
      >
        {{ accessIcon }}
      </v-icon>
    </template>
    <span>{{ accessText }}</span>
  </v-tooltip>
</template>

<style lang="css" scoped>
</style>
