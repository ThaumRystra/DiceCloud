<template lang="html">
	<div class="layout row wrap justify-start proficiency-form">
		<text-field
			label="Skill"
			class="mr-2"
			append-icon="arrow_drop_down"
			item-text="name"
			item-value="skill"
			:menu-props="{transition: 'slide-y-transition', lazy: true}"
			:value="model.skill"
			:items="undefined"
			@change="(value, ack) => $emit('change', {path: ['skill'], value, ack})"
		/>
		<smart-select
			label="Proficiency"
			append-icon="arrow_drop_down"
			class="mr-2 ml-3"
			:menu-props="{transition: 'slide-y-transition', lazy: true}"
			:items="values"
			:value="model.value"
			@change="(value, ack) => $emit('change', {path: ['value'], value, ack})"
		>
			<v-icon
				class="icon"
				slot="prepend"
				:class="iconClass"
			>{{displayedIcon}}</v-icon>
		</smart-select>
	</div>
</template>

<script>
	const ICON_SPIN_DURATION = 300;
	export default {
		props: {
			model: {
				type: Object,
				default: () => ({}),
			},
			stats: {
				type: Array,
			},
		},
		data(){ return {
			displayedIcon: 'radio_button_unchecked',
			iconClass: '',
			values: [
				{value: 1, text: 'Proficient'},
				{value: 0.5, text: 'Half proficiency bonus'},
				{value: 2, text: 'Double proficiency bonuys'},
			],
		}},
		methods: {
			proficiencyIcon(value){
				if (value == 0.5){
					return 'brightness_2';
				} else if (value == 1) {
					return 'brightness_1'
				} else if (value == 2){
					return 'album'
				} else {
					return 'radio_button_unchecked';
				}
			},
		},
		watch: {
			'model.value': {
				immediate: true,
				handler(newValue, oldValue, e){
					let newIcon = this.proficiencyIcon(newValue);
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
	.theme--light .icon {
		color: black;
	}
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
	.proficiency-form > div {
		flex-basis: 220px;
	}
</style>
