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
		<v-flex style="height: 20px; flex-basis: 300px; flex-grow: 100;">
			<v-layout
				column
				align-center
				@click="edit"
				style="cursor: pointer;"
				class="bar"
			>
				<v-progress-linear
					:value="(value / maxValue) * 100"
					height="20"
					color="green lighten-1"
					class="ma-0"
				>
				</v-progress-linear>
				<span
					class="value"
					style="margin-top: -20px; z-index: 1; font-size: 15px; font-weight: 600; height: 20px;"
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
						@click="$refs.editInput.focus()"
						class="mr-2"
					>
						<v-btn
							@click="toggleAdd(); $nextTick(() => $refs.editInput.focus())"
							class="filled"
						>
							<v-icon>add</v-icon>
						</v-btn>
						<v-btn
							@click="toggleSubtract(); $nextTick(() => $refs.editInput.focus())"
							class="filled"
						>
							<v-icon>remove</v-icon>
						</v-btn>
					</v-btn-toggle>
					<v-text-field
						solo
						hide-details
						type="number"
						v-if="editing"
						ref="editInput"
						style="max-width: 120px;"
						min="0"
						:value="editValue"
						:prepend-inner-icon="operationIcon(operation)"
						@focus="$event.target.select()"
						@keypress="keypress"
					>
					</v-text-field>
					<v-btn small fab @click="commitEdit" class="filled" color="red">
						<v-icon>done</v-icon>
					</v-btn>
					<v-btn small fab @click="cancelEdit" class="mx-0 filled">
						<v-icon>close</v-icon>
					</v-btn>
					<v-spacer />
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
		data() {
			return {
				editing: false,
				editValue: 0,
				operation: 3,
				hover: false,
			};
		},
		props: {
			value: Number,
			maxValue: Number,
			name: String,
			_id: String,
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
