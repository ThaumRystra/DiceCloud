<template lang="html">
  <v-card
    class="resource-card"
    :class="hover ? 'elevation-8': ''"
  >
    <v-layout>
      <div class="buttons layout column justify-center pl-3">
        <v-btn
          icon
          small
          :disabled="currentValue >= value || context.editPermission === false"
          @click="increment(1)"
        >
          <v-icon>mdi-chevron-up</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          :disabled="currentValue <= 0 || context.editPermission === false"
          @click="increment(-1)"
        >
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </div>
      <div
        class="layout align-center value pl-2 pr-3"
      >
        <div class="text-h4">
          {{ currentValue }}
        </div>
        <div class="text-h6 ml-2 max-value">
          /{{ value }}
        </div>
      </div>
      <div
        class="content layout align-center pr-3"
        @click="click"
        @mouseover="hover = true"
        @mouseleave="hover = false"
      >
        <div class="text-truncate ">
          {{ name }}
        </div>
      </div>
    </v-layout>
  </v-card>
</template>

<script lang="js">
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
  .resource-card {
    transition: box-shadow .4s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
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
