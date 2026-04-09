<template lang="html">
  <form-sections v-if="standalone">
    <v-expansion-panel>
      <v-expansion-panel-title>
        {{ name }}
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pt-4">
        <slot />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </form-sections>
  <v-expansion-panel v-else>
    <v-expansion-panel-title>
      {{ name }}
    </v-expansion-panel-title>
    <v-expansion-panel-text class="pt-4">
      <slot />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts">
import FormSections from '/imports/client/ui/properties/forms/shared/FormSections.vue';
export { FormSections };
</script>

<script setup lang="ts">
withDefaults(defineProps<{
  name?: string;
  standalone?: boolean;
}>(), {
  name: '',
  standalone: false,
});
</script>
