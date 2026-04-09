<template lang="html">
  <v-card
    hover
    style="height: 100%; overflow: hidden;"
    :class="{'text-accent': disabled}"
    :disabled="disabled"
    @click="e => $emit('click', e)"
  >
    <v-card-title
      class="subtitle pb-3"
      style="text-align: center;"
    >
      <v-avatar tile>
        <v-icon size="x-large">
          {{ property.icon }}
        </v-icon>
      </v-avatar>
      <span class="ml-3">
        {{ property.name }}
      </span>
    </v-card-title>
    <v-expand-transition>
      <div
        v-if="showPropertyHelp"
        class="mx-4"
      >
        {{ property.helpText }}
        <div style="height: 16px;" />
        <div
          v-if="property.examples"
          class="text-caption"
        >
          {{ property.examples }}
          <div style="height: 16px;" />
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';

defineProps<{
  property: Record<string, any>;
  disabled?: boolean;
}>();

const { result: showPropertyHelp } = autorun(() => {
  const user = Meteor.user();
  return !(user?.preferences?.hidePropertySelectDialogHelp);
});
</script>

<style lang="css" scoped>
</style>
