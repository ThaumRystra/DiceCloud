<template lang="html">
  <div>
		<v-slide-x-transition group>
			<div
				v-for="(adjustment, i) in model"
				:key="adjustment._id || i"
			>
				<v-divider v-if="i !== 0"/>
				<adjustment-form
					class="mt-4"
					:model="adjustment"
					:parent-target="parentTarget"
					@change="({path, value, ack}) => $emit('change', {path: [i, ...path], value, ack})"
				/>
				<div>
					<v-btn outline icon large class="ma-3" @click="$emit('pull', {path: [i]})">
						<v-icon>delete</v-icon>
					</v-btn>
				</div>
			</div>
		</v-slide-x-transition>
		<div class="layout row justify-end">
			<v-btn
				:loading="addAdjustmentLoading"
				:disabled="addAdjustmentLoading"
				outline
				@click="addAdjustment"
			>
				<v-icon>add</v-icon>
				Add Adjustment
			</v-btn>
		</div>
  </div>
</template>

<script>
	import AdjustmentForm from '/imports/ui/properties/forms/AdjustmentForm.vue';
	import AdjustmentSchema from '/imports/api/creature/subSchemas/AdjustmentSchema.js';

	export default {
		components: {
			AdjustmentForm,
		},
		data(){return {
			addAdjustmentLoading: false,
		}},
		methods: {
			acknowledgeAddAdjustment(){
				this.addAdjustmentLoading = false;
			},
			addAdjustment(){
				this.addAdjustmentLoading = true;
				this.$emit('push', {
					path: [],
					value: AdjustmentSchema.clean({}),
					ack: this.acknowledgeAddAdjustment,
				});
			},
		},
		props: {
			model: {
				type: Array,
				default: () => ([]),
			},
			parentTarget: {
				type: String,
			},
			debounceTime: Number,
		},
	}
</script>

<style lang="css" scoped>
</style>
