<template lang="html">
  <v-list-tile class="effect-viewer">
    <v-list-tile-avatar>
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
    </v-list-tile-avatar>
    <v-list-tile-action
      v-if="showValue"
      class="headline"
    >
      {{ displayedValue }}
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title>
        {{ model.name }}
      </v-list-tile-title>
      <v-list-tile-sub-title>
        <code
          v-for="stat in model.stats"
          :key="stat"
          class="mr-1"
        >{{ stat }}</code>
      </v-list-tile-sub-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
	import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';
  import { isFinite } from 'lodash';

	export default {
		mixins: [propertyViewerMixin],
		computed: {
			resolvedValue(){
				return this.model.result !== undefined ? this.model.result : this.model.calculation;
			},
			effectIcon(){
				let value = this.resolvedValue;
				return getEffectIcon(this.model.operation, value);
			},
			operation(){
				switch(this.model.operation) {
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
					case 'conditional': return;
          default: return undefined;
				}
			}
		},
	};
</script>

<style lang="css" scoped>
	.icon {
		min-width: 30px;
	}
	.icon {
		color: inherit !important;
	}
	.net-effect {
		flex-grow: 0;
		flex-shrink: 0;
	}
	.value, .calculation {
		min-width: 80px;
	}
</style>
