<template lang="html">
  <v-list-item
    class="effect-viewer layout align-center"
    v-on="!hideBreadcrumbs ? {click} : {}"
  >
    <div class="effect-icon">
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-icon
            class="mx-2"
            style="cursor: default;"
            large
            v-on="on"
          >
            {{ effectIcon }}
          </v-icon>
        </template>
        <span>{{ operation }}</span>
      </v-tooltip>
    </div>
    <div
      class="text-h4 effect-value mr-2"
    >
      {{ displayedValue }}
    </div>
    <div class="layout column my-2">
      <div class="text-body-1 mb-1">
        {{ displayedText }}
      </div>
      <div v-if="!hideBreadcrumbs && ancestors">
        <breadcrumbs
          :model="{...model, ancestors}"
          class="text-caption"
          no-links
          no-icons
          style="margin-bottom: 0"
        />
      </div>
    </div>
  </v-list-item>
</template>

<script lang="js">
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';
import Breadcrumbs from '/imports/client/ui/creature/creatureProperties/Breadcrumbs.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { isFinite } from 'lodash';

export default {
  components: {
    Breadcrumbs,
  },
  props: {
    hideBreadcrumbs: Boolean,
    model: {
      type: Object,
      required: true,
    },
    attribute: {
      type: Object,
      required: true,
    },
  },
  computed: {
    hasClickListener(){
      return this.$listeners && this.$listeners.click
    },
    displayedText(){
      if (this.operation === 'conditional'){
        return this.model.text || this.model.name || this.operation
      } else {
        return this.model.name || this.operation
      }
    },
    resolvedValue() {
      let amount = this.model.amount;
      if (!amount) return;
      return amount.value !== undefined ? amount.value : amount.calculation;
    },
    effectIcon(){
      let value = this.resolvedValue;
      return getEffectIcon(this.operation, value);
    },
    operation() {
      if (this.model.type === 'pointBuy' || this.model.type === 'attribute') {
        return 'base'
      }
      return this.model.operation;
    },
    operationText() {
      switch(this.operation) {
        case 'base': return 'Base value';
        case 'add': return 'Add';
        case 'mul': return 'Multiply';
        case 'min': return 'Minimum';
        case 'max': return 'Maximum';
        case 'advantage': return 'Advantage';
        case 'disadvantage': return 'Disadvantage';
        case 'passiveAdd': return 'Passive bonus';
        case 'fail': return 'Always fail';
        case 'conditional': return 'Conditional benefit' ;
        default: return '';
      }
    },
    showValue(){
      switch(this.operation) {
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
      if (this.model.type === 'pointBuy') {
        return find(this.model.values, row => this.attribute.variableName === row.variableName)?.value;
      } else if (this.model.type === 'attribute') {
        return this.model.baseValue?.value;
      }
      switch(this.operation) {
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
  meteor: {
    ancestors() {
      const prop = CreatureProperties.findOne(this.model._id);
      return prop && prop.ancestors || [];
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
    min-width: 30px;
  }
  .icon {
    color: inherit !important;
  }
  .net-effect {
    flex-grow: 0;
    flex-shrink: 0;
  }
  .effect-value {
    min-width: 60px;
    text-align: center;
  }
</style>
