<template>
  <div class="d-flex flex-column justify-center align-center">
    <v-btn-toggle
      :value="value"
      color="accent"
      @change="emitInput"
    >
      <v-btn :value="-1">
        {{ $t('AdvantageInput.sN61sdTDUmZNRJhgdk3FT') }}
      </v-btn>
      <v-btn :value="1">
        {{ $t('AdvantageInput.GOVw9p7PQMyvg1W3QMv1h') }}
      </v-btn>
    </v-btn-toggle>
    <div style="position: relative;">
      <v-scale-transition
        origin="center center"
      >
        <vertical-hex
          v-if="value"
          id="extra-hex"
          style="position:absolute; transition: margin-left 0.3s ease;"
          :style="{marginLeft: value == 1 ? '24px' : '-24px'}"
          disable-hover
        />
      </v-scale-transition>
      <vertical-hex
        id="roll-hex"
        @click="$emit('continue')"
      >
        <div>
          {{ $t('SelectedCreatureBar.NgRLZ1KujlD3o3EtzLY3R') }}
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
