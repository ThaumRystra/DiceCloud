<template lang="html">
  <v-list-item class="effect-viewer">
    <v-list-item-avatar>
      <v-tooltip bottom>
        <template
          v-if="effectIcon !== 'remove'"
          #activator="{ on }"
        >
          <v-icon
            class="mx-2"
            style="cursor: default;"
            v-on="on"
          >
            {{ effectIcon }}
          </v-icon>
        </template>
        <span>{{ tooltip }}</span>
      </v-tooltip>
    </v-list-item-avatar>
    <v-list-item-action class="text-h5">
      {{ displayedValue }}
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>
        <code>{{ model.stat }}</code>
        <template v-if="effectIcon === 'remove'">
          damage
        </template>
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
  import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';

	export default {
		mixins: [propertyViewerMixin],
    computed: {
      effectIcon(){
        let effectOp = this.model.operation === 'increment' ? 'add' : 'base';
				let value = this.value;
        if (typeof value === 'string'){
          value = 1;
        }
        return getEffectIcon(effectOp, -value);
			},
      value(){
        return 'amountResult' in this.model ?
          this.model.amountResult :
          this.model.amount;
      },
      displayedValue(){
        if (
          typeof this.value === 'number' &&
          this.model.operation !== 'set'
        ){
          return Math.abs(this.value);
        } else {
          return this.value;
        }
      },
      tooltip(){
        if (this.model.operation === 'increment'){
          if (
            typeof this.value === 'string' ||
            this.value >= 0
          ){
            return 'Minus';
          } else {
            return 'Add'
          }
        } else {
          return 'Set'
        }
      }
    },
	}
</script>

<style lang="css" scoped>
</style>
