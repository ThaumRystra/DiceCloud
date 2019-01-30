<template>
	<v-layout row wrap align-center justify-center style="min-height: 48px;" :class="{hover}" class="my-3 white" :id="`${_uid}-${_id}`">
		<div class="subheading text-truncate pa-2 name" @mouseover="hover = true" @mouseleave="hover = false" @click="$emit('click', {elementId: `${_uid}-${_id}`})">
			{{name}}
		</div>
		<v-flex style="height: 20px; flex-basis: 300px; flex-grow: 100;">
			<v-layout column align-center @click="edit" style="cursor: pointer;" class="bar">
				<v-progress-linear :value="(value / maxValue) * 100" height="20" color="green lighten-1" class="ma-0">
				</v-progress-linear>
				<span class="value"
					style="margin-top: -20px; z-index: 1; font-size: 16px; font-weight: 600; height: 20px;"
				>
					{{value}} / {{maxValue}}
				</span>
			</v-layout>
			<transition name="transition">
				<v-toolbar
					v-if="editing"
					justify-center
					height="48"
					flat
					class="transparent toolbar"
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
					<v-btn small fab @click="cancelEdit" class="mx-0 white">
						<v-icon>close</v-icon>
					</v-btn>
					<v-spacer/>
				</v-toolbar>
			</transition>
		</v-flex>
		<transition name="background-transition">
			<div v-if="editing" class="page-tint" @click="cancelEdit" />
		</transition>
	</v-layout>
</template>

<script>
	export default {
		data(){ return {
			editing: false,
			editValue: 0,
			operation: null,
			hover: false,
		}},
		props: {
			value: Number,
			maxValue: Number,
			name: String,
			_id: String,
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
	.name {
		text-align: center;
		cursor: pointer;
		min-width: 150px;
		flex-basis: 150px;
		flex-grow: 1;
		flex-shrink: 1;
	}
	.name:hover {
		font-weight: 500;
	}
	.bar {
		transition: box-shadow 0.2s;
	}
	.bar:hover {
		box-shadow: 0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)!important
	}
	.toolbar {
		margin-left: -50%;
		margin-right: -50%;
    width: 200%;
		margin-top: -34px !important;
		z-index: 4;
	}
	.hover {
		background: rgba(0,0,0,.04);
	}
	.background-transition-enter-active, .background-transition-leave-active{
		 transition: all .2s;
	 }
	.background-transition-enter, .background-transition-leave-to {
		opacity: 0;
	}
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
	.page-tint {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.15);
		z-index: 3;
	}
</style>
