<script setup lang="ts">
import { ref } from 'vue';
import ComputedField from '/imports/client/ui/properties/forms/shared/ComputedField.vue';
import InlineComputationField from '/imports/client/ui/properties/forms/shared/InlineComputationField.vue';
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';

const props = defineProps<{
  model?: Record<string, any>;
  errors?: Record<string, any>;
  startAsMilestone?: boolean;
}>();

const emit = defineEmits<{
  (e: 'change', arg: { path: string[]; value: any; ack?: any }): void;
}>();

const milestone = ref(props.startAsMilestone ?? false);

function change(path: string | string[], value: any, ack?: any) {
  if (!Array.isArray(path)) path = [path];
  emit('change', { path, value, ack });
}

function makeMilestone(val: boolean, ack?: any) {
  milestone.value = val;
  if (val) {
    change('xp', undefined);
    change('levels', 1, ack);
  } else {
    change('levels', undefined, ack);
  }
}
</script>

<template lang="html">
  <div class="experience-form">
    <div class="d-flex flex-column align-center">
      <smart-switch
        label="Milestone"
        class="mx-3"
        :value="milestone"
        @change="makeMilestone"
      />
      <text-field
        v-if="milestone"
        label="Levels"
        type="number"
        class="base-value-field text-center large-format no-flex"
        :value="model.levels"
        :error-messages="errors.levels"
        @change="change('levels', ...arguments)"
      />
      <text-field
        v-else
        type="number"
        class="base-value-field text-center large-format no-flex"
        suffix="XP"
        autofocus
        :value="model.xp"
        :error-messages="errors.xp"
        @change="change('xp', ...arguments)"
      />
    </div>
    <text-field
      label="Name"
      :autofocus="milestone"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
  </div>
</template>

<style lang="css" scoped>
</style>
