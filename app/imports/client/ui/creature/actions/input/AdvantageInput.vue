<template>
  <div class="d-flex flex-column justify-center align-center">
    <advantage-stepper
      :value="value"
      @input="emitInput"
    />
    <div style="position: relative;">
      <v-scale-transition
        origin="center center"
      >
        <vertical-hex
          v-if="value"
          id="extra-hex"
          style="position:absolute; transition: margin-left 0.3s ease;"
          :style="{marginLeft: Math.sign(value) * 24 + 'px'}"
          disable-hover
        />
      </v-scale-transition>
      <vertical-hex
        id="roll-hex"
        @click="$emit('continue')"
      >
        <div>
          Roll
        </div>
      </vertical-hex>
    </div>
  </div>
</template>

<script lang="js">
import VerticalHex from '/imports/client/ui/components/VerticalHex.vue';
import AdvantageStepper from '/imports/client/ui/creature/actions/input/AdvantageStepper.vue';

export default {
  components: {
    VerticalHex,
    AdvantageStepper,
  },
  props: {
    value: {
      type: Number,
      required: true,
    }
  },
  methods: {
    emitInput(e) {
      e = e || 0;
      this.$emit('input', e)
    }
  }
};
</script>
