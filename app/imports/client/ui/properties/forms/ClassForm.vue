<template lang="html">
  <div class="class-form">
    <v-row dense>
      <v-col
        cols="12"
      >
        <text-field
          :label="$t('AttributeForm.vWQj52YzUPPcXSMEZ6dvh')"
          :value="model.variableName"
          :hint="$t('ClassForm.FCdQw1K4vQj_se7Ve6yRB')"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="class">
      <form-section :name="$t('ClassForm.gDeOhXP1mwk3mW2dewYdr')">
        <tag-targeting
          :model="model"
          :errors="errors"
          tag-field="slotTags"
          :tag-hint="$t('ClassForm.ZEMvL6PhjpagHmRJkdzJu')"
          :or-hint="$t('ClassForm.gIBplAWYI81r77s3sTpXi')"
          :not-hint="$t('ClassForm.uQdLc6H0MB7BPD0raOaS3')"
          @change="e => $emit('change', e)"
          @push="e => $emit('push', e)"
          @pull="e => $emit('pull', e)"
        />

        <computed-field
          :label="$t('ClassForm.i6JHJs93-3cdtKgGlLO78')"
          :hint="$t('ClassForm.4TeEM-qHSXYRQWxrQioEF')"
          :placeholder="$t('PropertyForm.M6byRruoaG1QJnLgCQJzH')"
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
