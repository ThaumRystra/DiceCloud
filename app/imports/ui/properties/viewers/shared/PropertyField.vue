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
      @click="$emit('click', $event)"
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
              {{ calculationText }}
            </template>
          </slot>
        </div>
      </div>
    </v-sheet>
  </v-col>
</template>

<script lang="js">
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

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
    signed: Boolean,
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
    valueNotReduced(){
      if (!this.calculation) return;
      return typeof this.calculation.value === 'string'
    },
    calculationText(){
      const calculation = this.calculation;
      if (!calculation) {
        return undefined;
      }
      if (calculation.value === undefined){
        return calculation.calculation;
      }
      if (this.signed) {
        return numberToSignedString(calculation.value);
      }
      return calculation.value;
    },
    // large and center are only applied to calculations if we are showing their
    // value, if we are showing the calculation itself, large and center are
    // turned off
    isLarge(){
      if (this.showCalculationInsteadOfValue) return false;
      if (this.valueNotReduced) return false;
      return this.large;
    },
    isCenter(){
      if (this.showCalculationInsteadOfValue) return false;
      if (this.valueNotReduced) return false;
      return this.center;
    },
    isMono(){
      if (this.showCalculationInsteadOfValue) return true;
      if (this.valueNotReduced) return true;
      return this.mono;
    },
  },
  methods: {
    numberToSignedString,
  }
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
