<template>
  <v-layout
    row
    wrap
    align-center
    justify-center
    style="min-height: 48px;"
    :class="{ hover }"
    class="my-3 health-bar"
    :data-id="_id"
  >
    <div
      class="subheading text-truncate pa-2 name"
      @mouseover="hover = true"
      @mouseleave="hover = false"
      @click="$emit('click')"
    >
      {{ name }}
    </div>
    <v-flex
      style="
        height: 20px;
        flex-basis: 300px;
        flex-grow: 100;
      "
    >
      <v-layout
        column
        align-center
        style="cursor: pointer;"
        class="bar"
        @click="edit"
      >
        <v-progress-linear
          :value="(value / maxValue) * 100"
          height="20"
          color="green lighten-1"
          class="ma-0"
        />
        <span
          class="value"
          style="
            margin-top: -20px;
            z-index: 1;
            font-size: 15px;
            font-weight: 600;
            height: 20px;
          "
        >
          {{ value }} / {{ maxValue }}
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
          <v-spacer />
          <v-btn-toggle
            :value="operation === 'add' ? 0: operation === 'subtract' ? 1 : null"
            class="mr-2"
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
            v-if="editing"
            ref="editInput"
            solo
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
            small
            fab
            class="filled"
            color="red"
            @click="commitEdit"
          >
            <v-icon>done</v-icon>
          </v-btn>
          <v-btn
            small
            fab
            class="mx-0 filled"
            @click="cancelEdit"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-spacer />
        </v-toolbar>
      </transition>
    </v-flex>
    <transition name="background-transition">
      <div
        v-if="editing"
        class="page-tint"
        @click="cancelEdit"
      />
    </transition>
  </v-layout>
</template>

<script>
	export default {
    inject: {
      context: { default: {} }
    },
		props: {
			value: Number,
			maxValue: Number,
			name: String,
			_id: String,
		},
		data() {
			return {
				editing: false,
				editValue: 0,
				operation: 'set',
				hover: false,
			};
		},
		methods: {
			edit() {
				this.editing = true;
				this.operation = 'set';
				this.editValue = this.value;
				this.$nextTick(function() {
					this.$refs.editInput.focus();
				});
			},
			cancelEdit() {
				this.editing = false;
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
		},
	};
</script>

<style scoped>
	.health-bar {
		background: inherit;
	}
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
		box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
			0 1px 5px 0 rgba(0, 0, 0, 0.12) !important;
	}
	.toolbar {
		margin-left: -50%;
		margin-right: -50%;
		width: 200%;
		margin-top: -34px !important;
		z-index: 4;
	}
	.hover {
		background: #f5f5f5 !important;
	}
	.theme--dark .hover {
		background: #515151 !important;
	}
	.filled.theme--light {
		background: #fff !important;
	}
	.filled.theme--dark {
		background: #424242 !important;
	}
	.background-transition-enter-active,
	.background-transition-leave-active {
		transition: all 0.2s;
	}
	.background-transition-enter,
	.background-transition-leave-to {
		opacity: 0;
	}
	.transition-enter-active {
		transition: all 0.2s;
	}
	.transition-leave-active {
		transition: all 0.3s;
	}
	.transition-enter-to,
	.transition-leave {
		opacity: 1;
		transform: scaleY(1) !important;
	}
	.transition-enter,
	.transition-leave-to {
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
