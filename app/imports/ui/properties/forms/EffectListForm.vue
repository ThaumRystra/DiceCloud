<template lang="html">
  <div>
		<v-slide-x-transition group>
			<div
				v-for="(effect, i) in model"
				:key="effect._id || i"
			>
				<v-divider v-if="i !== 0"/>
				<div class="layout row align-center">
					<div style="flex-grow: 1;">
						<effect-form
							class="mt-4"
							:model="effect"
							:parent-target="parentTarget"
							:stored="stored"
							@change="({path, value, ack}) => $emit('change', {path: [i, ...path], value, ack})"
							@pull="(ack) => $emit('pull', {path: [i], ack})"
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
				:loading="addEffectLoading"
				:disabled="addEffectLoading"
				outline
				@click="addEffect"
			>
				<v-icon>add</v-icon>
				Add Effect
			</v-btn>
		</div>
  </div>
</template>

<script>
	import EffectForm from '/imports/ui/properties/forms/EffectForm.vue';
	import { EffectSchema } from '/imports/api/properties/Effects.js';

	export default {
		components: {
			EffectForm,
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
			addEffectLoading: false,
		}},
		methods: {
			acknowledgeAddEffect(){
				this.addEffectLoading = false;
			},
			addEffect(){
				this.addEffectLoading = true;
				this.$emit('push', {
					path: [],
					value: EffectSchema.clean({}),
					ack: this.acknowledgeAddEffect,
				});
			},
		},
	}
</script>

<style lang="css" scoped>
</style>
<template lang="html">
  <div>
		<v-slide-x-transition group>
			<div
				v-for="(effect, i) in model"
				:key="effect._id || i"
			>
				<v-divider v-if="i !== 0"/>
				<div class="layout row align-center">
					<div style="flex-grow: 1;">
						<effect-form
							class="mt-4"
							:model="effect"
							@change="({path, value, ack}) => $emit('change', {path: [i, ...path], value, ack})"
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
				:loading="addEffectLoading"
				:disabled="addEffectLoading"
				outline
				@click="addEffect"
			>
				<v-icon>add</v-icon>
				Add Effect
			</v-btn>
		</div>
  </div>
</template>

<script>
	import EffectForm from '/imports/ui/properties/forms/EffectForm.vue';
	import { EffectSchema } from '/imports/api/properties/Effects.js';

	export default {
		components: {
			EffectForm,
		},
		props: {
			model: {
				type: Array,
				default: () => ([]),
			},
			debounceTime: Number,
		},
		data(){return {
			addEffectLoading: false,
		}},
		methods: {
			acknowledgeAddEffect(){
				this.addEffectLoading = false;
			},
			addEffect(){
				this.addEffectLoading = true;
				this.$emit('push', {
					path: [],
					value: EffectSchema.clean({}),
					ack: this.acknowledgeAddEffect,
				});
			},
		},
	}
</script>

<style lang="css" scoped>
</style>
