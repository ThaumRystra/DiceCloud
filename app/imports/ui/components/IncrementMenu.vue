<template>
  <v-layout
    row
    align-center
    justify-center
    class="increment-menu"
  >
    <v-spacer />
    <v-btn-toggle
      :value="operation === 'add' ? 0: operation === 'subtract' ? 1 : null"
      class="mx-2"
      @click="$refs.editInput.focus()"
    >
      <v-btn
        :disabled="context.editPermission === false"
        class="filled"
        @click="toggleAdd(); $nextTick(() => $refs.editInput.focus())"
      >
        <v-icon>add</v-icon>
      </v-btn>
      <v-btn
        :disabled="context.editPermission === false"
        class="filled"
        @click="toggleSubtract(); $nextTick(() => $refs.editInput.focus())"
      >
        <v-icon>remove</v-icon>
      </v-btn>
    </v-btn-toggle>
    <v-text-field
      ref="editInput"
      :solo="!flat"
      :class="flat && 'ma-0 pa-0'"
      hide-details
      type="number"
      style="max-width: 120px;"
      min="0"
      :value="editValue"
      :prepend-inner-icon="operationIcon(operation)"
      :disabled="context.editPermission === false"
      @focus="$event.target.select()"
      @keypress="keypress"
      @input="input"
    />
    <v-btn
      :small="!flat"
      :fab="!flat"
      :flat="flat"
      :icon="flat"
      class="filled"
      @click="commitEdit"
    >
      <v-icon>done</v-icon>
    </v-btn>
    <v-btn
      :small="!flat"
      :fab="!flat"
      :flat="flat"
      :icon="flat"
      class="mx-0 filled"
      @click="cancelEdit"
    >
      <v-icon>close</v-icon>
    </v-btn>
    <v-spacer />
  </v-layout>
</template>

<script>
	export default {
    inject: {
      context: { default: {} }
    },
		props: {
			value: {
        type: Number,
        required: true,
      },
      open: Boolean,
      flat: Boolean,
		},
		data() {
			return {
				editValue: 0,
				operation: 'set',
				hover: false,
			};
		},
    watch: {
      open(newValue){
        if (newValue){
          this.resetData();
        }
      }
    },
		methods: {
      resetData(){
        this.editValue = this.value;
        this.operation = 'set';
        // this.$nextTick didn't work, using timeout instead did
        setTimeout(() => {
          if (this.$refs.editInput){
            this.$refs.editInput.focus();
          }
        }, 100);
      },
			cancelEdit() {
				this.$emit('close');
			},
			commitEdit() {
				this.editing = false;
				let value = +this.$refs.editInput.lazyValue;
				if (this.operation === 'add') {
					value = -value;
				}
				let type = this.operation === 'set' ? 'set' : 'increment';
				this.$emit('change', { type, value });
			},
			operationIcon(operation) {
				switch (operation) {
					case 'set':
						return 'forward';
					case 'add':
            return 'add';
					case 'subtract':
						return 'remove';
				}
			},
			toggleAdd(){
				this.operation = (this.operation === 'add') ? 'set': 'add';
			},
			toggleSubtract(){
				this.operation = (this.operation === 'subtract') ? 'set': 'subtract';
			},
			keypress(event) {
				let digitsOnly = /[0-9]/;
				let key = event.key;
				if (key === '+') {
					this.toggleAdd();
					event.preventDefault();
				} else if (key === '-') {
					this.toggleSubtract();
					event.preventDefault();
				} else if (key === 'Enter') {
					this.commitEdit();
				} else if (!digitsOnly.test(key)){
					event.preventDefault();
				}
			},
      input(value){
        if (+value < 0){
          this.editValue = -value;
          this.operation = 'subtract';
        }
      }
		}
	};
</script>

<style scoped>
	.filled.theme--light {
		background: #fff !important;
	}
	.filled.theme--dark {
		background: #424242 !important;
	}
</style>
