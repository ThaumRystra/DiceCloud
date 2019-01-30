<template lang="html">
	<dialog-base>
    <div slot="toolbar">
      {{name}}
    </div>
    <v-layout align-center column>
			<div class="display-3 mod" v-if="typeof mod === 'number'">
				{{numberToSignedString(mod)}}
			</div>
			<div class="display-1 value">
				{{value}}
			</div>
		</v-layout>
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
			value: Number,
			mod: Number,
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
	.value {
		font-weight: 600;
		font-size: 24px !important;
		color: rgba(0, 0, 0, 0.54);
	}
	.mod, .value {
		text-align: center;
		width: 100%;
	}
</style>
