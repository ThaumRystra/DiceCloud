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

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import { SlotSchema } from '/imports/api/properties/Slots';
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
  props: {
    classForm: Boolean,
  },
  data() {
    let slotTypes = [];
    for (let key in PROPERTIES) {
      slotTypes.push({ text: PROPERTIES[key].name, value: key });
    }
    return {
      slotTypes,
      addExtraTagsLoading: false,
      extraTagOperations: ['OR', 'NOT'],
    };
  },
  computed: {
    extraTagsFull() {
      if (!this.model.extraTags) return false;
      let maxCount = SlotSchema.get('extraTags', 'maxCount');
      return this.model.extraTags.length >= maxCount;
    }
  },
  methods: {
    acknowledgeAddResult() {
      this.addExtraTagsLoading = false;
    },
    addExtraTags() {
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
