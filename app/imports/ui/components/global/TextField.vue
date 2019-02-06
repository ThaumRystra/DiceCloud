<template lang="html">
  <v-text-field
		:error="error"
		:value="safeValue"
		@input="input"
		@focus="focused = true"
		@blur="focused = false"
	/>
</template>

<script>
	/*
	 * Component to handle text fields that update the database.
	 * Won't bash the text field while it's focused, even if the database trims
	 * or otherwise sanitizes the input.
	 * Emits input events on every input and emits debounced change
	 * events based on the debounceTime set in its props.
	 * Losing focus will set the value to the database's current stored value.
	 *
	 * Because attributes that aren't properties are passed to the root element,
	 * this is a drop-in replacement for v-text-field
	 *
	 * TODO extract this functionality as a mixin, and share to textarea
	 */
	import { _ } from 'underscore';
	export default {
		data(){ return {
			safeValue: this.value,
			focused: false,
			error: false,
			errorMessages: null,
		}},
		props: {
			value: [String, Number],
			debounceTime: {
				type: Number,
				default: 250,
			},
			validator: Function,
		},
		watch: {
			focused(isFocused){
				if (!isFocused){
					this.safeValue = this.value;
				}
			},
			value(newValue){
				if (!this.focused){
					this.safeValue = this.value;
				}
			},
		},
		methods: {
			input(val){
				this.$emit('input', val);
				this.update(val);
				if (this.validator){
					try {
						this.validator(val);
						this.error = false;
						this.errorMessages = null;
					} catch(e){
						this.error = true;
						this.errorMessages = e.message;
					}
				}
			},
		},
		created(){
			this.update = _.debounce(val => {
				this.$emit('change', val);
			}, this.debounceTime);
		},
	};
</script>
