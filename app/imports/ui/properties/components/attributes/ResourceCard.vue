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
          :disabled="model.value >= model.total || context.editPermission === false"
          @click="increment(1)"
        >
          <v-icon>mdi-chevron-up</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          :disabled="model.value <= 0 || context.editPermission === false"
          @click="increment(-1)"
        >
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </div>
      <div
        class="layout align-center value pl-2 pr-3"
      >
        <div class="text-h4">
          {{ model.value }}
        </div>
        <div class="text-h6 ml-2 max-value">
          /{{ model.total }}
        </div>
      </div>
      <div
        class="content layout align-center pr-3"
        @click="click"
        @mouseover="hover = true"
        @mouseleave="hover = false"
      >
        <div class="text-truncate ">
          {{ model.name }}
        </div>
      </div>
    </v-layout>
    <card-highlight :active="hover" />
  </v-card>
</template>

<script lang="js">
import CardHighlight from '/imports/ui/components/CardHighlight.vue';

	export default {
    components: {
      CardHighlight,
    },
    inject: {
      context: { default: {} }
    },
		props: {
			model: {
        type: Object,
        required: true,
      }
		},
		data(){ return{
			hover: false,
		}},
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
