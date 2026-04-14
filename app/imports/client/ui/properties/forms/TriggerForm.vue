<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { TriggerSchema, eventOptions, timingOptions, actionPropertyTypeOptions } from '/imports/api/properties/Triggers';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

const props = withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), { errors: () => ({}) });

const emit = defineEmits(['change', 'push']);

const context = inject<any>('context', {});

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}

const eventOptionsList = Object.keys(eventOptions).map(value => ({
  value,
  text: (eventOptions as Record<string, string>)[value],
}));

const timingOptionsList = Object.keys(timingOptions).map(value => ({
  value,
  text: (timingOptions as Record<string, string>)[value],
}));

const actionPropertyTypeOptionsList = Object.keys(actionPropertyTypeOptions).map(value => ({
  value,
  text: (actionPropertyTypeOptions as Record<string, string>)[value],
}));

const addExtraTagsLoading = ref(false);

const extraTagsFull = computed(() => {
  if (!props.model.extraTags) return false;
  const maxCount = TriggerSchema.get('extraTags', 'maxCount');
  return props.model.extraTags.length >= maxCount;
});

const showTags = computed(() =>
  props.model.event !== 'shortRest' &&
  props.model.event !== 'longRest' &&
  props.model.event !== 'anyRest'
);

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

<template lang="html">
  <div class="trigger-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          label="Timing"
          style="flex-basis: 300px;"
          hint="When this trigger will fire"
          :items="timingOptions"
          :value="model.timing"
          :error-messages="errors.timing"
          @change="change('timing', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          label="Event"
          style="flex-basis: 300px;"
          hint="What causes this trigger to fire"
          :items="eventOptions"
          :value="model.event"
          :error-messages="errors.event"
          @change="change('event', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="Condition"
          hint="A calculation to determine if this trigger should fire"
          placeholder="Always active"
          persistent-placeholder
          :model="model.condition"
          :error-messages="errors.condition"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['condition', ...path], value, ack})"
        />
      </v-col>
      <v-expand-transition>
        <v-col
          v-if="model.event === 'doActionProperty' || model.event === 'receiveActionProperty'"
          cols="12"
          md="6"
        >
          <smart-select
            label="Event Type"
            style="flex-basis: 300px;"
            hint="Which action event causes this trigger to fire"
            :items="actionPropertyTypeOptions"
            :value="model.actionPropertyType"
            :error-messages="errors.actionPropertyType"
            @change="change('actionPropertyType', ...arguments)"
          />
        </v-col>
      </v-expand-transition>
      <v-col cols="12">        
        <tag-targeting
          :model="model"
          :errors="errors"
          @change="e => $emit('change', e)"
          @push="e => $emit('push', e)"
          @pull="e => $emit('pull', e)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      class="mt-6"
      label="Description"
      hint="The rest of the description that doesn't fit in the summary goes here"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="trigger">
      <form-section
        name="Log"
      >
        <smart-switch
          label="Don't show in log"
          :value="model.silent"
          :error-messages="errors.silent"
          @change="change('silent', ...arguments)"
        />
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>
