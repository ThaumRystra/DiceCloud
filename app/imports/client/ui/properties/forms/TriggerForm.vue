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

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import {
  TriggerSchema, eventOptions, timingOptions, actionPropertyTypeOptions
} from '/imports/api/properties/Triggers';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

export default {
  components: {
    FormSection,
    TagTargeting,
  },
  mixins: [propertyFormMixin],
  inject: {
    context: { default: {} }
  },
  data(){
    return {
      addExtraTagsLoading: false,
      extraTagOperations: ['OR', 'NOT'],
      eventOptions: Object.keys(eventOptions).map(value => {
        return { value, text: eventOptions[value] };
      }),
      timingOptions: Object.keys(timingOptions).map(value => {
        return { value, text: timingOptions[value] };
      }),
      actionPropertyTypeOptions: Object.keys(actionPropertyTypeOptions).map(value => {
        return { value, text: actionPropertyTypeOptions[value] };
      }),
    };
  },
  computed: {
    extraTagsFull(){
      if (!this.model.extraTags) return false;
      let maxCount = TriggerSchema.get('extraTags', 'maxCount');
      return this.model.extraTags.length >= maxCount;
    },
    showTags() {
      return this.model.event !== 'shortRest' &&
        this.model.event !== 'longRest' &&
        this.model.event !== 'anyRest';
    }
  },
  methods: {
    acknowledgeAddResult(){
      this.addExtraTagsLoading = false;
    },
    addExtraTags(){
      this.addExtraTagsLoading = true;
      this.$emit('push', {
        path: ['extraTags'],
        value: {
          _id: Random.id(),
          operation: 'OR',
          tags: [],
        },
        ack: this.acknowledgeAddResult,
      });
    },
  },
};
</script>
