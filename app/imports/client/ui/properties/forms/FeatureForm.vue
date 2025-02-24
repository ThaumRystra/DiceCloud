<template lang="html">
  <div class="feature-form">
    <inline-computation-field
      :label="$t('ActionForm.uMqJz6So1tbWiONiw7coZ')"
      :hint="$t('FeatureForm.OIE9HAppn9fn1Vf6y-9E7')"
      :model="model.summary"
      :error-messages="errors['summary.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />

    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :hint="$t('FeatureForm.RxXMMLikrA240ehj7BMlt')"
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

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
  data() {
    return {
      enabledOptions: [
        {
          text: this.$t('FeatureForm.DfGBuKMfTw9c8qtZ9A3pl'),
          value: 'always',
        }, {
          text: this.$t('FeatureForm.GL4EbIj5qEFQytx900y66'),
          value: 'enabled',
        }, {
          text: this.$t('FeatureForm.wYzh3YiPCU7yo9eHbY--A'),
          value: 'disabled',
        }
      ],
    }
  },
  computed: {
    enabledStatus() {
      if (!this.model) return;
      if (this.model.alwaysEnabled) return 'always';
      if (this.model.enabled) return 'enabled';
      return 'disabled';
    },
  },
  methods: {
    changeEnabled(value, ack) {
      let change = ({ enabled, alwaysEnabled }) => {
        this.$emit('change', { path: ['enabled'], value: enabled, ack });
        this.$emit('change', { path: ['alwaysEnabled'], value: alwaysEnabled, ack });
      }
      if (value === 'always') {
        change({ enabled: true, alwaysEnabled: true });
      } else if (value === 'enabled') {
        change({ enabled: true, alwaysEnabled: false });
      } else if (value === 'disabled') {
        change({ enabled: false, alwaysEnabled: false });
      }
    },
  },
};
</script>

<style lang="css" scoped>

</style>
