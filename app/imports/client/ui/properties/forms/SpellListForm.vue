<template>
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

    <smart-combobox
      label="Spellcasting ability"
      :value="model.ability"
      hint="Which ability is used to cast spells in this spell list"
      :items="abilityScoreList"
      :error-messages="errors.ability"
      @change="changeAbility"
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

<script>
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties.js';

export default {
  mixins: [propertyFormMixin],
  meteor: {
    abilityScoreList() {
      return createListOfProperties({
        type: 'attribute',
        attributeType: 'ability',
      });
    },
  },
  methods: {
    changeAbility(value, ack) {
      this.$emit('change', { path: ['ability'], value, ack })
      const oldValue = this.model.ability;

      const attackRollBonus = this.model.attackRollBonus?.calculation;
      if (
        !attackRollBonus ||
        attackRollBonus === `proficiencyBonus + ${oldValue}.modifier`
      ) {
        this.$emit('change', {
          path: ['attackRollBonus', 'calculation'],
          value: `proficiencyBonus + ${value}.modifier`
        });
      }

      const dc = this.model.dc?.calculation;
      if (
        !dc || 
        dc === `8 + proficiencyBonus + ${oldValue}.modifier`
      ) {
        this.$emit('change', {
          path: ['dc', 'calculation'],
          value: `8 + proficiencyBonus + ${value}.modifier`
        });
      }
    }
  }
};
</script>

<style lang="css" scoped>
</style>
