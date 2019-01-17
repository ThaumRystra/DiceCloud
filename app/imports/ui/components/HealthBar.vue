<template>
	<div style="height: 48px;">
		<v-layout column align-center @click="edit">
			<v-progress-linear :value="(value / maxValue) * 100" height="20" color="green lighten-1">
			</v-progress-linear>
			<span class="value"
				style="margin-top: -35px; z-index: 1; font-size: 16px; font-weight: 600;"
			>
				{{value}} / {{maxValue}}
			</span>
		</v-layout>
		<transition name="transition">
			<v-toolbar
				v-if="editing"
				justify-center
				@blur="cancelEdit"
				height="48"
				flat
				class="transparent"
				style="margin-top: -36px; z-index: 2;"
			>
				<v-spacer/>
				<v-btn-toggle
					v-model="operation"
					@click="$refs.editInput.focus()"
					class="mr-2"
				>
					<v-btn @click="$refs.editInput.focus()" class="white"><v-icon>add</v-icon></v-btn>
					<v-btn @click="$refs.editInput.focus()" class="white"><v-icon>remove</v-icon></v-btn>
				</v-btn-toggle>
				<v-text-field solo hide-details
					type="number"
					v-if="editing"
					ref="editInput"
					style="max-width: 120px;"
					min="0"
					:value="editValue"
					:prefix="operation === 0 ? '+' : operation === 1 ? '-' : null"
					@focus="$event.target.select()"
					@keyup.enter="commitEdit"
					@keypress.43="operation === 0 ? operation = null : operation = 0"
					@keypress.45="operation === 1 ? operation = null : operation = 1"
					@keypress="rejectNonNumbers($event)"
				>
				</v-text-field>
				<v-btn small fab @click="commitEdit" class="white">
					<v-icon>done</v-icon>
				</v-btn>
				<v-btn small fab @click="cancelEdit" class="ml-0 white">
					<v-icon>close</v-icon>
				</v-btn>
				<v-spacer/>
			</v-toolbar>
		</transition>
	</div>
</template>

<script>
	export default {
		data(){ return {
			editing: false,
			editValue: 0,
			operation: null,
		}},
		props: {
			value: Number,
			maxValue: Number,
		},
		methods: {
			edit(){
				this.editing = true;
				this.operation = null;
				this.editValue = this.value;
				this.$nextTick(function(){
					this.$refs.editInput.focus();
				});
			},
			cancelEdit(){
				this.editing = false;
			},
			commitEdit(){
				this.editing = false;
				let value = +this.$refs.editInput.lazyValue;
				let type = this.operation === null ? 'set' : 'increment';
				if (this.operation === 1){
					value = -value;
				}
				this.$emit('change', {type, value});
			},
			rejectNonNumbers: function(evt) {
				evt = (evt) ? evt : window.event;
				var charCode = (evt.which) ? evt.which : evt.keyCode;
				if ((charCode > 31 && (charCode < 48 || charCode > 57)) || charCode === 46) {
					evt.preventDefault();;
				} else {
					return true;
				}
			},
		},
	}
</script>

<style scoped>
	.transition-enter-active{
		 transition: all .2s;
	 }
	 .transition-leave-active {
			transition: all .3s;
		}
	.transition-enter-to, .transition-leave {
		opacity: 1;
		transform: scaleY(1) !important;
	}
	.transition-enter, .transition-leave-to {
		opacity: 0;
		transform: scaleY(0) !important;
	}
</style>
