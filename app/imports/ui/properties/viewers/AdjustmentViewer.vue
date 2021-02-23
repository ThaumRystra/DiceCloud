<template lang="html">
  <v-list-tile class="effect-viewer">
    <v-list-tile-avatar>
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
    </v-list-tile-avatar>
    <v-list-tile-action class="headline">
      {{ displayedValue }}
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title>
        <code>{{ model.stat }}</code>
        <template v-if="effectIcon === 'remove'">
          damage
        </template>
      </v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
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
