<template>
  <v-layout
    column
    style="height: 100%;"
  >
    <slot
      name="replace-toolbar"
      :flat="!offsetTop"
    />
    <v-toolbar
      v-if="!$scopedSlots['replace-toolbar']"
      :color="computedColor"
      :dark="isDark"
      :light="!isDark"
      class="base-dialog-toolbar"
      :flat="!offsetTop"
    >
      <v-btn
        icon
        @click="back"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <slot name="toolbar" />
      <slot
        slot="extension"
        name="toolbar-extension"
      />
    </v-toolbar>
    <div
      v-if="$slots['unwrapped-content']"
      id="base-dialog-body"
      class="unwrapped-content"
      @scroll.passive="onScroll"
    >
      <slot name="unwrapped-content" />
    </div>
    <v-card-text
      v-else
      id="base-dialog-body"
      :class="{'dark-body': darkBody}"
      @scroll.passive="onScroll"
    >
      <slot />
    </v-card-text>
    <v-card-actions v-if="$slots.actions">
      <slot name="actions" />
    </v-card-actions>
  </v-layout>
</template>

<script lang="js">
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';

export default {
  props: {
    color: {
      type: String,
      default: undefined,
    },
    overrideBackButton: {
      type: Function,
      default: undefined,
    },
    darkBody: Boolean,
  },
  data() {
    return {
      offsetTop: 0,
    }
  },
  computed: {
    isDark() {
      return isDarkColor(this.computedColor);
    },
    computedColor() {
      return this.color || getThemeColor('secondary');
    }
  },
  methods: {
    onScroll(e) {
      this.offsetTop = e.target.scrollTop
    },
    back() {
      if (this.overrideBackButton) {
        this.overrideBackButton();
      } else {
        this.close();
      }
    },
    close() {
      this.$store.dispatch('popDialogStack');
    },
  },
}
</script>

<style scoped>
.base-dialog-toolbar {
  z-index: 2;
  border-radius: 2px 2px 0 0;
}

#base-dialog-body,
.unwrapped-content {
  flex-grow: 1;
  overflow: auto;
}

#base-dialog-body.dark-body {
  background-color: #fafafa;
}

.theme--dark #base-dialog-body.dark-body {
  background-color: #303030;
}
</style>
