<template lang="html">
  <v-card
    :hover="hasClickListener"
    :elevation="hovering ? 8 : undefined"
    class="toolbar-card"
    @click="$emit('click')"
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

<script>
	import isDarkColor from '/imports/ui/utility/isDarkColor.js';
	export default {
		props: {
			color: {
				type: String,
				default(){
					return this.$vuetify.theme.secondary;
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
</style>
