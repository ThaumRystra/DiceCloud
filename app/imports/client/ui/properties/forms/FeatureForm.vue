<template>
  <div class="feature-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <inline-computation-field
      label="Summary"
      hint="This will appear in the feature card in the character sheet"
      :model="model.summary"
      :error-messages="errors.summary"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />

    <inline-computation-field
      label="Description"
      hint="The rest of the description that doesn't fit in the summary goes here"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <smart-combobox
      label="Tags"
      multiple
      chips
      deletable-chips
      hint="Used to let slots find this property in a library, should otherwise be left blank"
      :value="model.tags"
      :error-messages="errors.tags"
      @change="change('tags', ...arguments)"
    />
    <form-section
      v-if="$slots.children"
      name="Children"
      standalone
    >
      <slot name="children" />
    </form-section>
  </div>
</template>

<script>
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';

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
