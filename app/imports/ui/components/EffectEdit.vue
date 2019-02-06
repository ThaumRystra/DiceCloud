<template lang="html">
	<v-layout row wrap class="effect-edit py-4 px-2">

		<!-- Operation -->
		<v-flex class="ma-1">
			<v-select
				label="Operation"
				append-icon="arrow_drop_down"
				:menu-props="{transition: 'slide-y-transition', lazy: true}"
				:items="operations"
				:value="this.effect.operation"
				@input="operation => $emit('change', {operation})"
			>
				<v-icon
					class="black--text icon"
					slot="prepend"
					:class="iconClass"
				>
					{{displayedIcon}}
				</v-icon>
				<template slot="item" slot-scope="item">
					<v-icon class="black--text icon mr-2">
						{{getEffectIcon(item.item.value, 1)}}
					</v-icon>
					{{item.item.text}}
				</template>
			</v-select>
		</v-flex>

		<!-- Value -->
		<v-flex class="ma-1">
			<v-text-field
				label="Value"
				:persistent-hint="needsValue"
				:value="needsValue ? (effect.calculation) : ' '"
				:disabled="!needsValue"
				:hint="!isFinite(effect.calculation) && effect.result ? effect.result + '' : '' "
				@input="calculation => $emit('change', {calculation})"
			/>
		</v-flex>

		<!-- Stat -->
		<v-flex class="ma-1">
			<v-autocomplete
				label="Stat"
				append-icon="arrow_drop_down"
				item-text="name"
				item-value="variableName"
				:menu-props="{transition: 'slide-y-transition', lazy: true}"
				:value="effect.stat"
				:items="stats"
				@input="stat => $emit('change', {stat})"
			/>
		</v-flex>

	</v-layout>
</template>

<script>
	import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';

	const ICON_SPIN_DURATION = 300;
	export default {
		props: {
			effect: {
				type: Object,
				default: {},
			},
			stats: {
				type: Array,
			},
		},
		data(){ return {
			displayedIcon: 'add',
			iconClass: '',
			operations: [
				{value: 'base', text: 'Base Value'},
				{value: 'add', text: 'Add'},
				{value: 'mul', text: 'Multiply'},
				{value: 'min', text: 'Minimum'},
				{value: 'max', text: 'Maximum'},
				{value: 'advantage', text: 'Advantage'},
				{value: 'disadvantage', text: 'Disadvantage'},
				{value: 'passiveAdd', text: 'Passive Bonus'},
				{value: 'fail', text: 'Fail'},
				{value: 'conditional', text: 'Conditional Benefit'},
			],
		}},
		computed: {
			needsValue(){
				switch(this.effect.operation) {
					case 'base': return true;
					case 'add': return true;
					case 'mul': return true;
					case 'min': return true;
					case 'max': return true;
					case 'advantage': return false;
					case 'disadvantage': return false;
					case 'passiveAdd': return true;
					case 'fail': return false;
					case 'conditional': return true;
				}
			},
		},
		methods: {
			getEffectIcon,
		},
		watch: {
			'effect.operation': {
				immediate: true,
				handler(newValue, oldValue, e){
					let newIcon = getEffectIcon(newValue, 1);
					if (!oldValue){
						// Skip animation
						this.displayedIcon = newIcon;
					} else {
						this.iconClass="leaving";
						setTimeout(() => {
							this.displayedIcon = newIcon;
							this.iconClass="arriving";
							requestAnimationFrame(() => {
								this.iconClass="";
							});
						}, ICON_SPIN_DURATION / 2);
					}
				},
			},
		}
	};
</script>

<style lang="css" scoped>
	.icon {
		min-width: 30px;
		transition: transform 0.15s linear, opacity 0.15s ease;
		transform-origin: 18px center;
		margin-left: -12px;
	}
	.icon.leaving {
		transform: translateY(-24px);
		opacity: 0;
	}
	.icon.arriving {
		transform: translateY(24px);
		opacity: 0;
		transition: none;
	}
	.hidden {
		visibility: hidden;
	}
	.flex {
		width: 220px;
	}
</style>
