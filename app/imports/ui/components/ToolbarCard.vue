<template lang="html">
  <v-card
    :hover="hasClickListener"
    class="toolbar-card"
    :class="hovering ? 'elevation-8': ''"
    @click.native="$emit('click')"
  >
    <v-toolbar
      flat
      :style="`transform: none; ${hasToolbarClickListener ? 'cursor: pointer;' : ''}`"
      :color="color"
      :dark="isDark"
      :light="!isDark"
      @click="$emit('toolbarclick')"
      @mouseover="hoverToolbar(true)"
      @mouseleave="hoverToolbar(false)"
    >
      <slot name="toolbar" />
    </v-toolbar>
    <div>
      <slot />
    </div>
  </v-card>
</template>

<script lang="js">
	import isDarkColor from '/imports/ui/utility/isDarkColor.js';
  import getThemeColor from '/imports/ui/utility/getThemeColor.js';

	export default {
		props: {
			color: {
				type: String,
				default(){
          return getThemeColor('secondary');
				},
			},
		},
    data(){ return {
      hovering: false,
    }},
		computed: {
			isDark(){
				return isDarkColor(this.color);
			},
			hasClickListener(){
        return this.$listeners && !!this.$listeners.click;
			},
			hasToolbarClickListener(){
        return this.$listeners && !!this.$listeners.toolbarclick;
			},
		},
    methods: {
      hoverToolbar(val){
        this.hovering = this.$listeners &&
          !!this.$listeners.toolbarclick &&
          val;
      }
    }
	};
</script>

<style lang="css">
.toolbar-card .v-toolbar__title {
  font-size: 14px;
}
.toolbar-card {
  transition: box-shadow .4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>
