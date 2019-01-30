<template lang="html">
	<dialog-base>
    <div slot="toolbar">
      {{name}}
    </div>
    <v-layout align-center column v-if="type === 'ability'">
			<div class="display-3 mod">
				{{numberToSignedString(mod)}}
			</div>
			<div class="display-1 ability-value">
				{{value}}
			</div>
		</v-layout>
		<div class="display-3 attribute-value" v-else-if="type === 'healthBar'">
			{{value+adjustment}} / {{value}}
		</div>
		<div class="display-3 attribute-value" v-else-if="type === 'modifier'">
			{{numberToSignedString(value)}}
		</div>
		<div class="display-3 attribute-value" v-else>
			{{value}}
		</div>
		<div v-if="effects && effects.length">
			<h6 class="title">Effects</h6>
			<attribute-effect-list :effects="effects" @click="clickedEffect"/>
		</div>
  </dialog-base>
</template>

<script>
	import store from "/imports/ui/vuexStore.js";
	import DialogBase from "/imports/ui/dialogStack/DialogBase.vue";
	import AttributeEffectList from '/imports/ui/components/AttributeEffectList.vue';
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

	export default {
		props: {
			name: String,
			type: String,
			value: Number,
			mod: Number,
			adjustment: Number,
			effects: Array,
		},
		methods: {
			numberToSignedString,
			clickedEffect(e){
				this.$emit('clickedEffect', e);
			},
		},
		components: {
			DialogBase,
			AttributeEffectList,
		},
	};
</script>

<style lang="css" scoped>
	.ability-value {
		font-weight: 600;
		font-size: 24px !important;
		color: rgba(0, 0, 0, 0.54);
	}
	.mod, .ability-value {
		text-align: center;
		width: 100%;
	}
	.attribute-value {
		text-align: center;
	}
</style>
