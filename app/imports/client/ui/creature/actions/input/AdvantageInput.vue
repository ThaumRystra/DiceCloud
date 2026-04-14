<script setup lang="ts">
import VerticalHex from '/imports/client/ui/components/VerticalHex.vue';

const props = defineProps<{
  value: number;
}>();

const emit = defineEmits<{
  continue: [];
  input: [value: number];
}>();

function emitInput(e: number) {
  emit('input', e || 0);
}
</script>

<template>
  <div class="d-flex flex-column justify-center align-center">
    <v-btn-toggle
      :model-value="value"
      color="accent"
      @update:model-value="emitInput"
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
          v-if="value"
          id="extra-hex"
          style="position:absolute; transition: margin-left 0.3s ease;"
          :style="{marginLeft: value == 1 ? '24px' : '-24px'}"
          disable-hover
        />
      </v-scale-transition>
      <vertical-hex
        id="roll-hex"
        @click="emit('continue')"
      >
        <div>
          Roll
        </div>
      </vertical-hex>
    </div>
  </div>
</template>
