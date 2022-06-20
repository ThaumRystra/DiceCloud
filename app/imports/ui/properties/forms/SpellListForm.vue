<template lang="html">
  <div class="attribute-form">
    <div class="layout wrap">
      <text-field
        ref="focusFirst"
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
    </div>

    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <computed-field
      label="Maximum prepared spells"
      hint="How many spells can be prepared"
      :model="model.maxPrepared"
      :error-messages="errors.maxPrepared"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['maxPrepared', ...path], value, ack})"
    />

    <computed-field
      label="Spell save DC"
      hint="The spell save DC of spells in this list"
      :model="model.dc"
      :error-messages="errors.dc"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['dc', ...path], value, ack})"
    />

    <computed-field
      label="Attack roll bonus"
      hint="The attack roll bonus of spell attacks made by spells in this list"
      :model="model.attackRollBonus"
      :error-messages="errors.attackRollBonus"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['attackRollBonus', ...path], value, ack})"
    />

    <smart-combobox
      label="Tags"
      multiple
      chips
      deletable-chips
      hint="Used to let slots find this property in a library, should otherwise be left blank"
      :value="model.tags"
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

<script lang="js">
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

export default {
  mixins: [propertyFormMixin],
};
</script>

<style lang="css" scoped>
</style>
