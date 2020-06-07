<template lang="html">
  <v-list-tile
    class="ability-list-tile"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-tile-avatar
      v-if="attack"
      class="headline"
    >
      {{ rollBonus }}
    </v-list-tile-avatar>
    <v-list-tile-content>
      <v-list-tile-title>
        {{ model.name }}
      </v-list-tile-title>
      <v-list-tile-sub-title
        v-if="childText"
        v-html="childText"
      />
    </v-list-tile-content>
    <v-list-tile-action v-if="model.usesResult">
      <v-list-tile-action-text>
        {{ model.usesResult - (model.usesUsed) }}/{{ model.usesResult }}
      </v-list-tile-action-text>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';

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
	},
  methods: {
    click(e){
			this.$emit('click', e);
		},
  }
}
</script>

<style lang="css" scoped>
</style>
