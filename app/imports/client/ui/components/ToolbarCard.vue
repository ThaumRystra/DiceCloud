<template lang="html">
  <v-card
    :hover="hasClickListener"
    class="toolbar-card"
    :class="{'transparent-toolbar': transparentToolbar, hovering}"
    :elevation="hovering ? 8 : undefined"
    @click.native="$emit('click')"
  >
    <v-toolbar
      flat
      :style="`transform: none; ${hasToolbarClickListener ? 'cursor: pointer;' : ''}`"
      :class="{}"
      :color="transparentToolbar ? undefined : color"
      :dark="transparentToolbar ? undefined : isDark"
      :light="transparentToolbar ? undefined : !isDark"
      @click="$emit('toolbarclick')"
      @mouseover="hoverToolbar(true)"
      @mouseleave="hoverToolbar(false)"
    >
      <slot name="toolbar" />
    </v-toolbar>
    <div>
      <slot />
    </div>
    <card-highlight :active="hovering" />
  </v-card>
</template>

<script lang="js">
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';

export default {
  components: {
    CardHighlight,
  },
  props: {
    color: {
      type: String,
      default() {
        return getThemeColor('secondary');
      },
    },
    transparentToolbar: Boolean,
  },
  data() {
    return {
      hovering: false,
    }
  },
  computed: {
    isDark() {
      return isDarkColor(this.color);
    },
    hasClickListener() {
      return this.$listeners && !!this.$listeners.click;
    },
    hasToolbarClickListener() {
      return this.$listeners && !!this.$listeners.toolbarclick;
    },
  },
  methods: {
    hoverToolbar(val) {
      this.hovering = this.$listeners &&
        !!this.$listeners.toolbarclick &&
        val;
    }
  }
};
</script>

<style lang="css">
.toolbar-card .v-toolbar__title {
  font-size: 15px;
}

.toolbar-card {
  transition: box-shadow .4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toolbar-card.transparent-toolbar .theme--dark.v-toolbar.v-sheet {
  background-color: #303030;
}
</style>
