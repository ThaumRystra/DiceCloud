<template lang="html">
  <div class="toggle-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          :label="$t('properties.forms.common.variableName')"
          :value="model.variableName"
          :hint="$t('properties.forms.common.variableNameHint')"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <smart-toggle
          :label="$t('properties.forms.toggleForm.active')"
          :value="radioSelection"
          :options="[
            {name: $t('properties.forms.toggleForm.enabled'), value: 'enabled'},
            {name: $t('properties.forms.toggleForm.disabled'), value: 'disabled'},
            {name: $t('properties.forms.toggleForm.calculated'), value: 'calculated'},
          ]"
          :error-messages="errors.enabled"
          @change="radioChange"
        />
      </v-col>
      <v-expand-transition>
        <v-col
          v-show="radioSelection === 'calculated'"
          cols="12"
        >
          <computed-field
            :label="$t('properties.forms.toggleForm.condition')"
            :hint="$t('properties.forms.toggleForm.conditionHint')"
            :model="model.condition"
            :error-messages="errors.condition"
            @change="({path, value, ack}) =>
              $emit('change', {path: ['condition', ...path], value, ack})"
          />
        </v-col>
      </v-expand-transition>
      <v-col cols="12">
        <smart-toggle
          :label="$t('properties.forms.toggleForm.enableOrDisable')"
          :value="model.targetByTags"
          :options="[
            {name: $t('properties.forms.toggleForm.descendants'), value: false},
            {name: $t('properties.forms.toggleForm.byTargetTags'), value: true},
          ]"
          @change="change('targetByTags', ...arguments)"
        />
      </v-col>
      <v-col cols="12">
        <v-expand-transition>
          <tag-targeting
            v-if="model.targetByTags"
            :model="model"
            :errors="errors"
            @change="e => $emit('change', e)"
            @push="e => $emit('push', e)"
            @pull="e => $emit('pull', e)"
          />
        </v-expand-transition>
      </v-col>
    </v-row>

    <form-sections type="toggle">
      <form-section :name="$t('properties.forms.common.behavior')">
        <v-col
          cols="12"
          md="6"
        >
          <smart-switch
            class="ml-2"
            :label="$t('properties.forms.toggleForm.showOnCharacterSheet')"
            :value="model.showUI"
            :error-messages="errors.showUI"
            @change="change('showUI', ...arguments)"
          />
        </v-col>
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

export default {
  components: {
    TagTargeting,
  },
  mixins: [propertyFormMixin],
  computed: {
    radioSelection() {
      if (this.model.disabled) {
        return 'disabled';
      } else if (this.model.enabled) {
        return 'enabled'
      } else {
        return 'calculated';
      }
    }
  },
  methods: {
    radioChange(value, ack) {
      if (value === 'enabled') {
        this.$emit('change', { path: ['enabled'], value: true, ack });
        this.$emit('change', { path: ['disabled'], value: false, ack });
      } else if (value === 'disabled') {
        this.$emit('change', { path: ['disabled'], value: true, ack });
        this.$emit('change', { path: ['enabled'], value: false, ack });
      } else if (value === 'calculated') {
        this.$emit('change', { path: ['disabled'], value: false, ack });
        this.$emit('change', { path: ['enabled'], value: false, ack });
      }
    }
  }
};
</script>

<style lang="css" scoped>

</style>
