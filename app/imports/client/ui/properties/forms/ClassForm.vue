<template lang="html">
  <div class="class-form">
    <v-row dense>
      <v-col
        cols="12"
      >
        <text-field
          label="Variable name"
          :value="model.variableName"
          hint="Use this name in calculations to reference this class"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="class">
      <form-section name="Class levels from libraries">
        <tag-targeting
          :model="model"
          :errors="errors"
          tag-field="slotTags"
          tag-hint="Find class levels that have all of these tags"
          or-hint="Also find class levels that have all of these tags instead"
          not-hint="Ignore class levels that have any of these tags"
          @change="e => $emit('change', e)"
          @push="e => $emit('push', e)"
          @pull="e => $emit('pull', e)"
        />

        <computed-field
          label="Active condition"
          hint="A calculation to determine if this class can have class levels added to it"
          placeholder="Always active"
          :model="model.slotCondition"
          :error-messages="errors.slotCondition"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['slotCondition', ...path], value, ack})"
        />
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import { SlotSchema } from '/imports/api/properties/Slots';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

const props = withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
  classForm?: boolean;
}>(), {
  errors: () => ({}),
  classForm: false,
});

const emit = defineEmits(['change', 'push']);

const context = inject<any>('context', {});

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}

const slotTypes: Array<{ text: string; value: string }> = [];
for (const key in PROPERTIES) {
  slotTypes.push({ text: (PROPERTIES as any)[key].name, value: key });
}

const addExtraTagsLoading = ref(false);

const extraTagsFull = computed(() => {
  if (!props.model.extraTags) return false;
  const maxCount = SlotSchema.get('extraTags', 'maxCount');
  return props.model.extraTags.length >= maxCount;
});

function addExtraTags() {
  addExtraTagsLoading.value = true;
  emit('push', {
    path: ['extraTags'],
    value: {
      _id: Random.id(),
      operation: 'OR',
      tags: [],
    },
    ack() {
      addExtraTagsLoading.value = false;
    },
  });
}
</script>
