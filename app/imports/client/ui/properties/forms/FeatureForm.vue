<template lang="html">
  <div class="feature-form">
    <inline-computation-field
      label="Summary"
      hint="This will appear in the feature card in the character sheet"
      :model="model.summary"
      :error-messages="errors['summary.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />

    <inline-computation-field
      label="Description"
      hint="The rest of the description that doesn't fit in the summary goes here"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />


    <form-sections
      v-if="$slots.default"
      type="feature"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), {
  errors: () => ({}),
});
</script>

<style lang="css" scoped>

</style>
