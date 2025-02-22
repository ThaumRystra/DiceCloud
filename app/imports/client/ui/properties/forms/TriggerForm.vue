<template lang="html">
  <div class="trigger-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          :label="$t('TriggerForm.9ynLx9unJDKhHC_H8HtuQ')"
          style="flex-basis: 300px;"
          :hint="$t('TriggerForm.1kLSBTRguWTVkr1Bl34OJ')"
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
          :label="$t('ActionForm.3ylc2njgCKwqOiWNQLFrF')"
          style="flex-basis: 300px;"
          :hint="$t('TriggerForm.UR1nS6CHflXegdBGP8nf5')"
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
          :label="$t('PropertyForm.reKPKGEnAfdHpBLoywE1w')"
          :hint="$t('TriggerForm.3g6bXRuWPHUd5UzDNIN2d')"
          :placeholder="$t('PropertyForm.M6byRruoaG1QJnLgCQJzH')"
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
            :label="$t('TriggerForm.F5P5mtqa7m0WJCf_h_p7i')"
            style="flex-basis: 300px;"
            :hint="$t('TriggerForm.V4dU_S294du0JIB3PCtg-')"
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
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :hint="$t('FeatureForm.RxXMMLikrA240ehj7BMlt')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="trigger">
      <form-section
        :name="$t('ActionForm.7JkrChA5Oz7n_-wF0QxsW')"
      >
        <smart-switch
          :label="$t('ActionForm.pTOkAuMdrx_hGI0E1xQl2')"
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
