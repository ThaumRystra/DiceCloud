<template lang="html">
  <div>
		<v-slide-x-transition group>
			<div
				v-for="(buff, i) in model"
				:key="buff._id || i"
			>
				<v-divider v-if="i !== 0"/>
				<div class="layout row align-center">
					<div style="flex-grow: 1;">
						<buff-form
							class="mt-4"
							:model="buff"
							:parent-target="parentTarget"
							:stored="stored"
							@change="({path, value, ack}) => $emit('change', {path: [i, ...path], value, ack})"
							@push="({path, value, ack}) => $emit('push', {path: [i, ...path], value, ack})"
							@pull="({path, ack}) => $emit('pull', {path: [i, ...path], ack})"
						/>
					</div>
					<v-btn outline icon large class="ma-3" @click="$emit('pull', {path: [i]})">
						<v-icon>delete</v-icon>
					</v-btn>
				</div>
			</div>
		</v-slide-x-transition>
		<div class="layout row justify-end">
			<v-btn
				:loading="addBuffLoading"
				:disabled="addBuffLoading"
				outline
				@click="addBuff"
			>
				<v-icon>add</v-icon>
				Add Buff
			</v-btn>
		</div>
  </div>
</template>

<script>
	import BuffForm from '/imports/ui/creature/properties/buffs/BuffForm.vue';
	import {StoredBuffSchema, AppliedBuffSchema} from '/imports/api/creature/properties/Buffs.js';

	export default {
		components: {
			BuffForm,
		},
		props: {
			stored: Boolean,
			model: {
				type: Array,
				default: () => ([]),
			},
			parentTarget: {
				type: String,
			},
			debounceTime: Number,
		},
		data(){return {
			addBuffLoading: false,
		}},
		methods: {
			acknowledgeAddBuff(){
				this.addBuffLoading = false;
			},
			addBuff(){
				this.addBuffLoading = true;
				let schema = this.stored ? StoredBuffSchema : AppliedBuffSchema;
				this.$emit('push', {path: [], value: schema.clean({}), ack: this.acknowledgeAddBuff});
			},
		},
	}
</script>

<style lang="css" scoped>
</style>
