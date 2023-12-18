<template lang="html">
  <div class="buff-form">
    <smart-select
      label="Branch Type"
      :items="typeOptions"
      :hint="typeHint"
      :value="model.branchType"
      :error-messages="errors.branchType"
      :menu-props="{auto: true, lazy: true}"
      @change="change('branchType', ...arguments)"
    />
    <v-expand-transition>
      <computed-field
        v-if="model.branchType === 'if'"
        label="Condition"
        hint="If this resolved to a true value, the child properties will be applied"
        :model="model.condition"
        :error-messages="errors.condition"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['condition', ...path], value, ack})"
      />
      <computed-field
        v-else-if="model.branchType === 'index'"
        label="Index"
        hint="Which child to apply. An index of 2 will choose the 2nd child."
        :model="model.condition"
        :error-messages="errors.condition"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['condition', ...path], value, ack})"
      />
    </v-expand-transition>
    <form-sections type="branch">
      <form-section name="Log">
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

export default {
  mixins: [propertyFormMixin],
  props: {
    parentTarget: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      typeOptions: [
        { value: 'if', text: 'If condition is true' },
        { value: 'hit', text: 'Attack hit' },
        { value: 'miss', text: 'Attack miss' },
        { value: 'failedSave', text: 'Save failed' },
        { value: 'successfulSave', text: 'Save succeeded' },
        { value: 'eachTarget', text: 'Apply to each target' },
        { value: 'random', text: 'Random' },
        { value: 'index', text: 'Calculated index' },
        { value: 'choice', text: 'User choice' },
      ],
    }
  },
  computed: {
    typeHint() {
      switch (this.model.branchType) {
        case 'if': return 'If the condition is true, the child properties are applied';
        case 'hit': return 'If the parent attack hits, the child properties are applied';
        case 'miss': return 'If the parent attack misses, the child properties are applied';
        case 'failedSave': return 'If the parent save is failed, the child properties are applied';
        case 'successfulSave': return 'If the parent save is made, the child properties are applied';
        case 'eachTarget': return 'Applies each child property once per target';
        case 'random': return 'Chooses one child property at random and applies it';
        case 'index': return 'Chooses one child property to apply based on the given index';
        case 'choice': return 'Pause the action and let the user choose which child to apply';
        default: return '';
      }
    }
  }
}
</script>

<style lang="css" scoped>

</style>
