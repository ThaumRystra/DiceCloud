<template lang="html">
  <div class="trigger-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />

    <smart-select
      label="Timing"
      style="flex-basis: 300px;"
      hint="When this trigger will fire"
      :items="timingOptions"
      :value="model.timing"
      :error-messages="errors.timing"
      @change="change('timing', ...arguments)"
    />
    <smart-select
      label="Event"
      style="flex-basis: 300px;"
      hint="What causes this trigger to fire"
      :items="eventOptions"
      :value="model.event"
      :error-messages="errors.event"
      @change="change('event', ...arguments)"
    />
    <smart-select
      v-if="model.event === 'doActionProperty' || model.event === 'receiveActionProperty'"
      label="Event Type"
      style="flex-basis: 300px;"
      hint="Which action event causes this trigger to fire"
      :items="actionPropertyTypeOptions"
      :value="model.actionPropertyType"
      :error-messages="errors.actionPropertyType"
      @change="change('actionPropertyType', ...arguments)"
    />

    <v-layout
      v-show="showTags"
      align-center
    >
      <v-btn
        icon
        style="margin-top: -30px;"
        class="mr-2"
        :loading="addExtraTagsLoading"
        :disabled="extraTagsFull"
        @click="addExtraTags"
      >
        <v-icon>
          mdi-plus
        </v-icon>
      </v-btn>
      <smart-combobox
        label="Tags Required"
        hint="The trigger will be fired by a property which has all the listed tags"
        multiple
        chips
        deletable-chips
        :value="model.targetTags"
        :error-messages="errors.targetTags"
        @change="change('targetTags', ...arguments)"
      />
    </v-layout>
    <v-slide-x-transition
      v-show="showTags"
      group
    >
      <div
        v-for="(extras, i) in model.extraTags"
        :key="extras._id"
        class="extra-tags layout align-center justify-space-between"
      >
        <smart-select
          label="Operation"
          style="width: 90px; flex-grow: 0;"
          :items="extraTagOperations"
          :value="extras.operation"
          :error-messages="errors.extraTags && errors.extraTags[i]"
          @change="change(['extraTags', i, 'operation'], ...arguments)"
        />
        <smart-combobox
          label="Tags"
          :hint="extras.operation === 'OR' ? 'The trigger can be fired by a property that has all of these tags instead' : 'The trigger won\'t be fired by a property that has any of these tags'"
          class="mx-2"
          multiple
          chips
          deletable-chips
          :value="extras.tags"
          @change="change(['extraTags', i, 'tags'], ...arguments)"
        />
        <v-btn
          icon
          style="margin-top: -30px;"
          @click="$emit('pull', {path: ['extraTags', i]})"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </v-slide-x-transition>

    <computed-field
      label="Condition"
      hint="A caclulation to determine if this trigger should fire"
      placeholder="Always active"
      :model="model.condition"
      :error-messages="errors.condition"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['condition', ...path], value, ack})"
    />

    <inline-computation-field
      label="Description"
      hint="The rest of the description that doesn't fit in the summary goes here"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections>
      <form-section
        v-if="$slots.children"
        name="Children"
      >
        <slot name="children" />
      </form-section>

      <form-section
        name="Advanced"
      >
        <smart-combobox
          label="Tags"
          hint="This trigger's own tags"
          multiple
          chips
          deletable-chips
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
        <smart-switch
          label="Don't show in log"
          :value="model.silent"
          :error-messages="errors.silent"
          @change="change('silent', ...arguments)"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import {
  TriggerSchema, eventOptions, timingOptions, actionPropertyTypeOptions
} from '/imports/api/properties/Triggers.js';

export default {
  components: {
    FormSection,
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
