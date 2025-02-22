<template lang="html">
  <div class="spell-list-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          :label="$t('SpellListForm.-S8t64gUIlS_M6wcwTYi2')"
          :hint="$t('SpellListForm.lEY_HbzhVJhDadjXDzLHC')"
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
          :label="$t('SpellListForm.sJVB7VP-LJqBWgObeUqHZ')"
          :value="model.ability"
          :hint="$t('SpellListForm.pCjZEGorK8Kv5cAlHqt5A')"
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
          :label="$t('SpellListForm.6oCOmu8CpiZy89q1l6Z_E')"
          :hint="$t('SpellListForm.XFsGG3xbc6pmw8NWyO2YL')"
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
          :label="$t('SpellListForm.KQA6DzSentAneUoHFTGBB')"
          :hint="$t('SpellListForm.BYthVQEmQLux4Ao3GDdcN')"
          :model="model.attackRollBonus"
          :error-messages="errors.attackRollBonus"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['attackRollBonus', ...path], value, ack})"
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
