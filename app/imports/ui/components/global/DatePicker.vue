<template lang="html">
	<v-menu
    v-model="menu"
    :close-on-content-click="false"
    lazy
    transition="scale-transition"
    full-width
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        :value="formattedSafeValue"
        v-bind="$attrs"
        prepend-icon="event"
        readonly
        v-on="on"
				:loading="loading"
        :error-messages="errors"
				@focus="focused = true"
				@blur="focused = false"
				box
      ></v-text-field>
    </template>
    <v-date-picker :value="formattedSafeValue" @input="dateInput"></v-date-picker>
  </v-menu>
</template>

<script>
import SmartInput from '/imports/ui/components/global/SmartInputMixin.js';
import { format } from 'date-fns';

export default {
	mixins: [SmartInput],
	data(){return {
		menu: false,
	};},
	methods: {
		dateInput(e){
			this.menu = false;
			this.input(e);
		},
	},
	computed: {
		formattedSafeValue(){
			return format(this.safeValue, 'YYYY-MM-DD')
		},
	},
}
</script>

<style lang="css" scoped>
</style>
