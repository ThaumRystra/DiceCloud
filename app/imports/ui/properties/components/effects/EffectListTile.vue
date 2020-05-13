<template lang="html">
  <v-list-tile
    class="effect-list-tile"
    :class="{disabled: !enabled}"
    :data-id="_id"
    v-on="$listeners.click ? { click(e){
      $emit('click', $props)
    } } : {}"
  >
    <v-list-tile-avatar>
      <v-icon class="icon">
        {{ getEffectIcon(model.operation, model.result) }}
      </v-icon>
    </v-list-tile-avatar>
    <v-list-tile-action>
      <div
        v-if="showValue(model.operation)"
        class="value display-1  pr-2"
      >
        {{ getValue(model.operation, model.result) }}
      </div>
      <div
        v-else
        class="calculation body-2 pr-2"
      >
        {{ model.operation === 'conditional' ? model.calculation : '' }}
      </div>
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title
        v-if="showStatName"
        class="stat"
      >
        {{ model.statName }}
      </v-list-tile-title>
      <v-list-tile-title
        v-else
        class="name"
      >
        {{ model.name }}
      </v-list-tile-title>
      <v-list-tile-sub-title class="operation">
        {{ getOperation(model.operation) }}
      </v-list-tile-sub-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
	import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';
	export default {
		props: {
			enabled: Boolean,
      showStatName: Boolean,
      model: {
        type: Object,
        required: true,
      },
		},
		methods: {
			getEffectIcon,
			getOperation(op){
				switch(op) {
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
				}
			},
			showValue(op){
				switch(op) {
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
				}
			},
			getValue(op, value){
				switch(op) {
					case 'base': return value;
					case 'add': return Math.abs(value);
					case 'mul': return value;
					case 'min': return value;
					case 'max': return value;
					case 'advantage': return;
					case 'disadvantage': return;
					case 'passiveAdd': return Math.abs(value);
					case 'fail': return;
					case 'conditional': return;
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
