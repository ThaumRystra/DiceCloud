<template lang="html">
  <v-card
    class="action"
    @click="$emit('click')"
  >
    <v-card-title
      primary-title
      class="layout row pa-2"
    >
      <div class="avatar">
        <v-btn
          flat
          icon
          class="headline"
          :disabled="model.insufficientResources"
          @click.stop="doAction"
        >
          <template v-if="rollBonus">
            {{ rollBonus }}
          </template>
          <v-icon v-else>
            $vuetify.icons.action
          </v-icon>
        </v-btn>
      </div>
      <div class="action-header flex">
        <div class="action-title">
          {{ model.name }}
        </div>
        <div class="action-type">
          action type text
        </div>
      </div>
      <div class="action-uses">
        {{ usesLeft }}/{{ totalUses }}
      </div>
    </v-card-title>
    <v-card-text
      v-if="childText"
      class="action-details"
      v-html="childText"
    />
  </v-card>
</template>

<script>
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';
import doAction from '/imports/api/creature/actions/doAction.js';

export default {
  inject: {
    context: {
      default: {},
    },
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    attack: {
      type: Boolean,
    },
  },
  computed: {
		hasClickListener(){
      return this.$listeners && this.$listeners.click
		},
    rollBonus(){
      return numberToSignedString(this.model.rollBonusResult);
    },
    childText(){
      let scope = this.context.creature && this.context.creature.variables;
      if (!this.model.children || !this.model.children.length) return;
      let textArray = [];
      this.model.children.forEach(child => {
        if (child.type === 'damage'){
          let { result } = evaluateString(child.amount, scope);
          textArray.push(`${result} ${child.damageType}`);
        } else if (child.type === 'savingThrow'){
          textArray.push(`DC ${child.dcResult} ${child.name}`);
        }
      });
      return textArray.join(' ');
    },
    totalUses(){
      return Math.max(this.model.usesResult, 0);
    },
    usesLeft(){
      return Math.max(this.model.usesResult - this.model.usesUsed, 0);
    },
	},
  methods: {
    click(e){
			this.$emit('click', e);
		},
    doAction(){
      doAction.call({actionId: this.model._id}, error => {
        if (error){
          console.error(error);
        }
      });
    },
  }
}
</script>

<style lang="css" scoped>
</style>
