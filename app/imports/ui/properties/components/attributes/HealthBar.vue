<template>
  <v-layout
    wrap
    align-center
    justify-center
    style="min-height: 42px;"
    :class="{ hover }"
    class="my-1 health-bar"
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
        height: 24px;
        flex-basis: 300px;
        flex-grow: 100;
      "
    >
      <div
        column
        align-center
        style="cursor: pointer;"
        class="bar"
        @click="edit"
      >
        <div
          style="height: 24px; width: 100%; position: relative; transition: background-color 0.5s ease;"
          :style="{
            backgroundColor: barBackgroundColor
          }"
        >
          <div
            class="filler"
            style="height: 100%; transform-origin: left; transition: all 0.5s ease;"
            :style="{
              backgroundColor: barColor,
              transform: `scaleX(${value / maxValue})`,
            }"
          />
          <div
            class="value"
            :class="{
              'white--text': isTextLight,
              'black--text': !isTextLight,
            }"
            style="
              font-size: 15px;
              line-height: 24px;
              font-weight: 600;
              position: absolute;
              left: 0;
              top: 0;
              right: 0;
              bottom: 0;
              text-align: center;

            "
          >
            {{ value }} / {{ maxValue }}
          </div>
        </div>
      </div>
      <transition name="transition">
        <increment-menu
          v-show="editing"
          :value="value"
          :open="editing"
          @change="changeIncrementMenu"
          @close="cancelEdit"
        />
      </transition>
      <transition name="background-transition">
        <div
          v-if="editing"
          class="page-tint"
          @click="cancelEdit"
        />
      </transition>
    </v-flex>
  </v-layout>
</template>

<script lang="js">
import IncrementMenu from '/imports/ui/components/IncrementMenu.vue';
import isDarkColor from '/imports/ui/utility/isDarkColor.js';
import chroma from 'chroma-js';

	export default {
    components: {
      IncrementMenu
    },
		props: {
			value: Number,
			maxValue: Number,
			name: String,
      color: {
        type: String,
        default: '#66BB6A',
      },
      midColor: {
        type: String,
        default: undefined,
      },
      lowColor: {
        type: String,
        default: undefined,
      },
			_id: String,
		},
		data() {
			return {
				editing: false,
				hover: false,
			};
		},
    computed: {
      barColor() {
        const fraction = this.value / this.maxValue;
        if (!Number.isFinite(fraction)) return this.color;
        if (fraction > 0.5){
          return this.color;
        } else if (this.midColor && this.lowColor) {
          return chroma.mix(this.lowColor, this.midColor, fraction * 2).hex();
        } else if (this.midColor){
          return this.midColor;
        }
        return this.color;
      },
      barBackgroundColor(){
        return chroma(this.barColor)
        .darken(1.5)
        .desaturate(1.5)
        .hex();
      },
      isTextLight(){
        return isDarkColor(this.barBackgroundColor);
        /* Change color at the halfway mark
        const fraction = this.value / this.maxValue;
        if (fraction >= 0.5){
          return isDarkColor(this.barColor);
        } else {
          return isDarkColor(this.barBackgroundColor);
        }
        */
      }
    },
		methods: {
			edit() {
				this.editing = true;
			},
			cancelEdit() {
				this.editing = false;
			},
      changeIncrementMenu(e){
        this.$emit('change', e);
        this.editing = false;
      }
		},
	};
</script>

<style>
.health-bar .increment-menu {
  margin-left: -50%;
  margin-right: -50%;
  width: 200%;
  margin-top: -34px !important;
  z-index: 7;
  position: relative;
}
</style>

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
		z-index: 6;
	}
</style>
