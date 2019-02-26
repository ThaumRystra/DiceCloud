<template lang="html">
	<dialog-base>
    <div slot="toolbar">
      {{name}}
    </div>
		<div>
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
			<attribute-effect-list v-if="attribueBaseEffect" :effects="[attribueBaseEffect]"/>
			<div v-if="effects && effects.length">
				<h6 class="title">Effects</h6>
				<attribute-effect-list :effects="effects" @click="clickedEffect"/>
			</div>
		</div>
		<div slot="edit">
			<attribute-edit :attribute="$props" @change="(update, ack) => $emit('change', update, ack)"/>
		</div>
  </dialog-base>
</template>

<script>
	import DialogBase from "/imports/ui/dialogStack/DialogBase.vue";
	import AttributeEffectList from '/imports/ui/components/attributes/AttributeEffectList.vue';
	import AttributeEdit from '/imports/ui/components/attributes/AttributeEdit.vue';
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

	export default {
		props: {
			charId: String,
			name: String,
			variableName: String,
			order: Number,
			type: String,
			baseValue: Number,
			value: Number,
			mod: Number,
			adjustment: Number,
			decimal: Boolean,
			reset: String,
			resetMultiplier: Number,
			color: String,
			adjustment: {type: Number, default: 0},
			effects: {type: Array, default: () => []},
		},
		methods: {
			numberToSignedString,
			clickedEffect(e){
				this.$emit('clickedEffect', e);
			},
		},
		computed: {
			attribueBaseEffect(){
				if (!this.baseValue) return;
				return {
					_id: 'attributeBaseValue',
					name: `${this.name}`,
					operation: 'base',
					result: this.baseValue,
					stat: this.variableName,
					enabled: true,
				};
			},
		},
		components: {
			DialogBase,
			AttributeEffectList,
			AttributeEdit,
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
