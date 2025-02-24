<template lang="html">
  <v-list-item
    class="effect-viewer layout align-center"
    dense
    v-on="!hideBreadcrumbs ? {click} : {}"
  >
    <div class="effect-icon">
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-icon
            class="mx-2"
            style="cursor: default;"
            v-on="on"
          >
            {{ effectIcon }}
          </v-icon>
        </template>
        <span>{{ operation }}</span>
      </v-tooltip>
    </div>
    <v-list-item-content>
      <v-list-item-title>
        <span
          class="effect-value mr-2"
        >
          {{ displayedValue }}
        </span>
        {{ displayedText }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
  import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';
import { isFinite } from 'lodash';
  import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

  export default {
    props: {
      hideBreadcrumbs: Boolean,
      effectId: {
        type: String,
        required: true,
      },
    },
    meteor: {
      model() {
        return CreatureProperties.findOne(this.effectId);
      },
    },
    computed: {
      hasClickListener(){
        return this.$listeners && this.$listeners.click
      },
      displayedText(){
        if (this.model.operation === 'conditional'){
          return this.model.text || this.model.name || this.operation
        } else {
          return this.model.name || this.operation
        }
      },
      resolvedValue(){
        let amount = this.model.amount;
        if (!amount) return;
        return amount.value !== undefined ? amount.value : amount.calculation;
      },
      effectIcon(){
        let value = this.resolvedValue;
        return getEffectIcon(this.model.operation, value);
      },
      operation(){
        switch(this.model.operation) {
          case 'base': return this.$t('AttributeEffect.NbNtxtSkIF-eEvpQ6M1VH');
          case 'add': return this.$t('AttributeEffect.9iZBUqNtV818puHQ9S5mA');
          case 'mul': return this.$t('AttributeEffect.Y45EOUc4qxDGlx5Xzle92');
          case 'min': return this.$t('AttributeEffect.PWglsxP8zZNtoVCZtbg-l');
          case 'max': return this.$t('AttributeEffect.dEk96gl0uh7EJIwSh--a6');
          case 'advantage': return this.$t('AdvantageInput.GOVw9p7PQMyvg1W3QMv1h');
          case 'disadvantage': return this.$t('AdvantageInput.sN61sdTDUmZNRJhgdk3FT');
          case 'passiveAdd': return this.$t('AttributeEffect.TdH_tc2p6Vkb18y3GO7hY');
          case 'fail': return this.$t('AttributeEffect.UzlEh2YQm-EU6POm5FZsj');
          case 'conditional': return this.$t('AttributeEffect.sZxywbspgVnqysC8fZKES') ;
          default: return '';
        }
      },
      showValue(){
        switch(this.model.operation) {
          case 'base': return true;
          case 'add': return true;
          case 'mul': return true;
          case 'min': return true;
          case 'max': return true;
          case 'advantage': return false;
          case 'disadvantage': return false;
          case 'passiveAdd': return true;
          case 'fail': return false;
          case 'conditional': return false;
          default: return false;
        }
      },
      displayedValue(){
        let value = this.resolvedValue;
        switch(this.model.operation) {
          case 'base': return value;
          case 'add': return isFinite(value) ? Math.abs(value) : value;
          case 'mul': return value;
          case 'min': return value;
          case 'max': return value;
          case 'advantage': return;
          case 'disadvantage': return;
          case 'passiveAdd': return isFinite(value) ? Math.abs(value) : value;
          case 'fail': return;
          case 'conditional': return undefined;
          default: return undefined;
        }
      }
    },
    methods: {
      click(e){
        this.$emit('click', e);
      },
    },
  };
</script>

<style lang="css" scoped>
  .icon, .effect-icon {
    min-width: 20px;
  }
  .icon {
    color: inherit !important;
  }
  .net-effect {
    flex-grow: 0;
    flex-shrink: 0;
  }
  .effect-value {
    min-width: 30px;
    text-align: center;
  }
</style>
