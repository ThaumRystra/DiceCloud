<template lang="html">
  <div class="spell-list-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="Maximum prepared spells"
          hint="How many spells can be prepared"
          :model="model.maxPrepared"
          :error-messages="errors.maxPrepared"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['maxPrepared', ...path], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
          label="Spellcasting ability"
          :value="model.ability"
          hint="Which ability is used to cast spells in this spell list"
          :items="abilityScoreList"
          :error-messages="errors.ability"
          @change="changeAbility"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="Spell save DC"
          hint="The spell save DC of spells in this list"
          :model="model.dc"
          :error-messages="errors.dc"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['dc', ...path], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="Attack roll bonus"
          hint="The attack roll bonus of spell attacks made by spells in this list"
          :model="model.attackRollBonus"
          :error-messages="errors.attackRollBonus"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['attackRollBonus', ...path], value, ack})"
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

    <form-sections
      v-if="$slots.default"
      type="spellList"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';

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
        value &&
        (!attackRollBonus ||
        attackRollBonus === `proficiencyBonus + ${oldValue}.modifier`)
      ) {
        this.$emit('change', {
          path: ['attackRollBonus', 'calculation'],
          value: `proficiencyBonus + ${value}.modifier`
        });
      }

      const dc = this.model.dc?.calculation;
      if (
        value &&
        (!dc || 
        dc === `8 + proficiencyBonus + ${oldValue}.modifier`)
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
