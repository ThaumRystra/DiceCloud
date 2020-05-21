<template lang="html">
  <v-list-tile
    class="hit-dice-list-tile"
    :class="{hover}"
  >
    <v-list-tile-action class="mr-4">
      <v-layout
        row
        align-center
        class="left"
      >
        <v-layout
          column
          class="buttons"
          justify-center
        >
          <v-btn
            icon
            small
            :disabled="currentValue >= model.value || context.editPermission === false"
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
        </v-layout>

        <v-layout
          row
          align-end
        >
          <div class="display-1">
            {{ currentValue }}
          </div>
          <div class="title max-value ml-2">
            /{{ model.value }}
          </div>
        </v-layout>
      </v-layout>
    </v-list-tile-action>

    <v-list-tile-content
      class="content"
      @click="click"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      <v-list-tile-title>
        {{ model.hitDiceSize }} <computed
          class="d-inline"
          signed
          value="constitution.modifier"
        />
      </v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';
export default {
  components: {
    Computed: ComputedForCreature,
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
  computed: {
    currentValue(){
      return this.model.value - (this.model.damage || 0);
    }
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
	.hit-dice-list-tile {
		background: inherit;
	}
	.hit-dice-list-tile >>> .v-list__tile {
		height: 88px;
	}
	.left {
		height: 100%;
	}
	.buttons {
		height: 100%;
	}
	.buttons > .v-btn {
		margin: 0;
	}
	.hit-dice-list-tile.hover {
		background: #f5f5f5 !important;
	}
	.theme--dark .hit-dice-list-tile.hover {
		background: #515151 !important;
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
