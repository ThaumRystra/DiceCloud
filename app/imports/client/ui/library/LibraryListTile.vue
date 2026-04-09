<template
  lang="html"
>
  <v-list-item
    v-bind="$attrs"
    :class="(isSelected || selectedByCollection) && !disabled && 'text-primary v-list-item--active'"
    :to="selection ? undefined : to"
    @click="singleSelect && $emit('select')"
  >
    <template
      v-if="selection && !singleSelect"
      #prepend
    >
      <v-checkbox
        :disabled="disabled"
        :model-value="disabled || isSelected"
        :off-icon="selectedByCollection ? 'mdi-checkbox-intermediate' : undefined"
        @change="e => $emit('select', e)"
        @click.stop
      />
    </template>
    <template v-else #prepend>
      <shared-icon :model="model" />
    </template>
    <v-list-item-title>
      {{ model.name }}
    </v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
import SharedIcon from '/imports/client/ui/components/SharedIcon.vue';

defineProps<{
  model: Record<string, any>;
  selection?: boolean;
  singleSelect?: boolean;
  isSelected?: boolean;
  selectedByCollection?: boolean;
  disabled?: boolean;
  to: Record<string, any>;
}>();
</script>
