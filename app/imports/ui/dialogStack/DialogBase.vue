<template>
  <v-layout
    column
    style="height: 100%;"
  >
    <slot
      name="replace-toolbar"
      :flat="!offsetTop"
    >
      <v-toolbar
        :color="computedColor"
        :dark="isDark"
        :light="!isDark"
        class="base-dialog-toolbar"
        :flat="!offsetTop"
      >
        <v-btn
          icon
          flat
          @click="back"
        >
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <slot name="toolbar" />
      </v-toolbar>
    </slot>
    <div
      v-if="$slots['unwrapped-content']"
      class="unwrapped-content"
    >
      <slot name="unwrapped-content" />
    </div>
    <v-card-text
      v-if="!$slots['unwrapped-content']"
      id="base-dialog-body"
      v-scroll:#base-dialog-body="onScroll"
    >
      <slot />
    </v-card-text>
    <v-card-actions v-if="$slots.actions">
      <slot name="actions" />
    </v-card-actions>
  </v-layout>
</template>

<script>
  import isDarkColor from '/imports/ui/utility/isDarkColor.js';

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
		},
		data(){ return {
			offsetTop: 0,
		}},
    computed: {
      isDark(){
        return isDarkColor(this.computedColor);
      },
      computedColor(){
        return this.color || this.$vuetify.theme.secondary;
      }
    },
		methods: {
			onScroll(e){
				this.offsetTop = e.target.scrollTop
			},
			back(){
				if (this.overrideBackButton){
					this.overrideBackButton();
				} else {
					this.close();
				}
			},
			close(){
        this.$store.dispatch('popDialogStack');
      },
		},
	}
</script>

<style scoped>
	.base-dialog-toolbar {
		z-index: 1;
		border-radius: 2px 2px 0 0;
	}
	#base-dialog-body, .unwrapped-content {
		flex-grow: 1;
		overflow: auto;
	}
</style>
