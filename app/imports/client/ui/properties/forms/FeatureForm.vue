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

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
  data() {
    return {
      enabledOptions: [
        {
          text: 'Always enabled',
          value: 'always',
        }, {
          text: 'Enabled',
          value: 'enabled',
        }, {
          text: 'Disabled',
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
