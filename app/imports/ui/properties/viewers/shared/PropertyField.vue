<template lang="html">
  <v-col
    v-if="value !== undefined ||
      calculation !== undefined ||
      ($slots.default && $slots.default.length)"
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
            'text-body-1': !isLarge,
            'text-h4': isLarge,
            'justify-center': isCenter,
            'justify-end': end,
            'mono': isMono,
          }"
          style="overflow-x: auto;"
          v-bind="$attrs"
        >
          <slot>
            <template v-if="value !== undefined">
              {{ value }}
            </template>
            <template v-else-if="calculation !== undefined">
              {{
                calculation.value !== undefined ?
                  calculation.value :
                  calculation.calculation
              }}
            </template>
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
    calculation: {
      type: Object,
      default: undefined,
    },
    center: Boolean,
    end: Boolean,
    large: Boolean,
    mono: Boolean,
    cols: {
      type: Object,
      default: () => ({cols: 12, sm: 6, md: 4}),
    },
	},
  computed: {
    showCalculationInsteadOfValue(){
      if (!this.calculation) return;
      return this.calculation && this.calculation.value === undefined;
    },
    // large and center are only applied to calculations if we are showing their
    // value, if we are showing the calculation itself, large and center are
    // turned off
    isLarge(){
      if (this.showCalculationInsteadOfValue) return false;
      return this.large;
    },
    isCenter(){
      if (this.showCalculationInsteadOfValue) return false;
      return this.center;
    },
    isMono(){
      if (this.showCalculationInsteadOfValue) return true;
      return this.mono;
    }
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
