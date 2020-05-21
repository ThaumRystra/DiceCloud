<template lang="html">
  <v-card
    class="resource-card layout row"
    :class="hover ? 'elevation-8': ''"
  >
    <div class="buttons layout column justify-center pl-3">
      <v-btn
        icon
        small
        :disabled="currentValue >= value || context.editPermission === false"
        @click="increment(1)"
      >
        <v-icon>arrow_drop_up</v-icon>
      </v-btn>
      <v-btn
        icon
        small
        :disabled="currentValue <= 0 || context.editPermission === false"
        @click="increment(-1)"
      >
        <v-icon>arrow_drop_down</v-icon>
      </v-btn>
    </div>
    <div
      class="layout row align-center value pl-2 pr-3"
    >
      <div class="display-1">
        {{ currentValue }}
      </div>
      <div class="title ml-2 max-value">
        /{{ value }}
      </div>
    </div>
    <div
      class="content layout row align-center pr-3"
      @click="click"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      <div class="text-truncate ">
        {{ name }}
      </div>
    </div>
  </v-card>
</template>

<script>
	export default {
		props: {
			_id: String,
			name: String,
			color: String,
			value: Number,
			damage: Number,
		},
		data(){ return{
			hover: false,
		}},
    inject: {
      context: { default: {} }
    },
		computed: {
			currentValue(){
				return this.value - (this.damage || 0);
			},
		},
		methods: {
			click(e){
				this.$emit('click', e);
			},
			increment(value){
				this.$emit('change', {type: 'increment', value})
			},
		},
	};
</script>

<style lang="css" scoped>
	.resource-card > div {
		padding-top: 16px;
		padding-bottom: 16px;
	}
	.buttons, .value {
		flex-shrink: 0;
		flex-grow: 0;
	}
	.buttons > .v-btn {
		margin: 0;
	}
	.content {
		cursor: pointer;
	}
	.max-value {
		color: rgba(0,0,0,.54);
	}
	.theme--dark .max-value {
		color: rgba(255, 255, 255, 0.54);
	}
</style>
