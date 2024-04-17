<template>
  <div class="d-flex flex-column justify-center align-center">
    <v-btn-toggle
      :value="value.advantage"
      color="accent"
      @change="changeAdvantage"
    >
      <v-btn :value="-1">
        Disadvantage
      </v-btn>
      <v-btn :value="1">
        Advantage
      </v-btn>
    </v-btn-toggle>
    <div style="position: relative;">
      <v-scale-transition
        origin="center center"
      >
        <vertical-hex
          v-if="value.advantage"
          id="extra-hex"
          style="position:absolute; transition: margin-left 0.3s ease;"
          :style="{marginLeft: value.advantage == 1 ? '24px' : '-24px'}"
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

export default {
  components: {
    VerticalHex
  },
  props: {
    value: {
      type: Object,
      required: true,
    }
  },
  methods: {
    changeAdvantage(e) {
      const newValue = { ...this.value, advantage: e };
      this.$emit('input', newValue)
    },
  }
};
</script>
