<template>
  <v-layout
    wrap
    align-center
    justify-center
    style="min-height: 42px;"
    :class="{ hover }"
    class="my-1 health-bar"
    :data-id="model._id"
  >
    <div
      class="subheading text-truncate pa-2 name"
      @mouseover="hover = true"
      @mouseleave="hover = false"
      @click="$emit('click')"
    >
      {{ model.name }}
    </div>
    <v-flex
      style="height: 24px; flex-basis: 300px; flex-grow: 100;"
    >
      <health-bar-progress
        :model="model"
        style="cursor: pointer;"
        @click="edit"
      >
        <div
          class="value"
          :class="{
            'white--text': isTextLight,
            'black--text': !isTextLight,
          }"
          style="font-size: 15px;
              line-height: 24px;
              font-weight: 600;
              position: absolute;
              left: 0;
              top: 0;
              right: 0;
              bottom: 0;
              text-align: center;"
        >
          {{ model.value }} / {{ model.total }}
        </div>
      </health-bar-progress>
      <v-menu
        v-model="editing"
        absolute
        transition="scale-transition"
        origin="center center"
        content-class="no-menu-shadow"
        :position-x="x"
        :position-y="y"
        :min-width="305"
        :close-on-content-click="false"
      >
        <increment-menu
          :value="model.value"
          :open="editing"
          @change="changeIncrementMenu"
          @close="cancelEdit"
        />
      </v-menu>
    </v-flex>
  </v-layout>
</template>

<script lang="js">
import IncrementMenu from '/imports/client/ui/components/IncrementMenu.vue';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import HealthBarProgress from '/imports/client/ui/properties/components/attributes/HealthBarProgress.vue';
import chroma from 'chroma-js';

export default {
  components: {
    IncrementMenu,
    HealthBarProgress,
  },
  inject: {
    theme: {
      default: {
        isDark: false,
      },
    },
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    _id: String,
  },
  data() {
    return {
      editing: false,
      hover: false,
      x: 0,
      y: 0,
    };
  },
  computed: {
    fillFraction() {
      let fraction = this.model.value / this.model.total;
      if (fraction < 0) fraction = 0;
      if (fraction > 1) fraction = 1;
      return fraction;
    },
    color() {
      return this.model.color || this.$vuetify.theme.currentTheme.primary
    },
    barColor() {
      const fraction = this.model.value / this.model.total;
      if (!Number.isFinite(fraction)) return this.color;
      if (fraction > 0.5) {
        return this.color;
      } else if (this.model.healthBarColorMid && this.model.healthBarColorLow) {
        return chroma.mix(this.model.healthBarColorLow, this.model.healthBarColorMid, fraction * 2).hex();
      } else if (this.model.healthBarColorMid) {
        return this.model.healthBarColorMid;
      }
      return this.color;
    },
    barBackgroundColor() {
      return chroma(this.barColor)
        .darken(1.5)
        .desaturate(1.5)
        .hex();
    },
    isTextLight() {
      return isDarkColor(this.barBackgroundColor);
      /* Change color at the halfway mark
      const fraction = this.model.value / this.model.total;
      if (fraction >= 0.5){
        return isDarkColor(this.barColor);
      } else {
        return isDarkColor(this.barBackgroundColor);
      }
      */
    }
  },
  methods: {
    edit(e) {
      e.preventDefault()
      this.editing = false;
      this.x = e.clientX - 165;
      this.y = e.clientY - 24;
      this.$nextTick(() => {
        this.editing = true
      });
    },
    cancelEdit() {
      this.editing = false;
    },
    changeIncrementMenu({ type, value }) {
      if (type === 'increment') value = -value;
      this.$emit('change', { type, value });
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

.no-menu-shadow {
  box-shadow: none !important;
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
