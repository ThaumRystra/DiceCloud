<template lang="html">
  <v-col
    v-if="value !== undefined || ($slots.default && $slots.default.length)"
    v-bind="cols"
    class="mb-3"
  >
    <v-sheet
      outlined
      class="pa-2 layout column align-start fill-height"
    >
      <v-sheet
        v-if="name"
        class="text-caption px-1 name"
        style="margin-top: -18px;"
      >
        {{ name }}
      </v-sheet>
      <div
        class="flex-grow-1 layout align-center"
        style="width: 100%;"
      >
        <div
          class="layout align-center"
          :class="{
            'text-body-1': !large,
            'text-h4': large,
            'justify-center': center,
            'mono': mono,
          }"
          style="overflow-x: auto;"
          v-bind="$attrs"
        >
          <slot>
            {{ value }}
          </slot>
        </div>
      </div>
    </v-sheet>
  </v-col>
</template>

<script lang="js">
export default {
	props: {
		name: {
      type: String,
      default: undefined,
    },
		value: {
      type: [String, Number, Boolean],
      default: undefined,
    },
    center: Boolean,
    large: Boolean,
    mono: Boolean,
    cols: {
      type: Object,
      default: () => ({cols: 12, sm: 6, md: 4}),
    },
	},
}
</script>

<style lang="css" scoped>
.name {
  color: rgba(0,0,0,.6);
}
.theme--dark .name {
  color: rgba(255,255,255,.6);
}
.mono {
  font-family: monospace !important;
}
</style>
