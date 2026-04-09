<template lang="html">
  <v-list-item
    class="hit-dice-list-tile"
    :class="{hover}"
  >
    <template #prepend>
      <div class="d-flex align-center float-left">
        <div class="d-flex flex-column buttons justify-center">
          <v-btn
            icon
            size="small"
            :disabled="model.value >= model.total || context.editPermission === false"
            @click="increment(1)"
          >
            <v-icon>mdi-chevron-up</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            :disabled="model.value <= 0 || context.editPermission === false"
            @click="increment(-1)"
          >
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </div>

        <div class="d-flex align-end">
          <div class="text-h4">
            {{ model.value }}
          </div>
          <div class="text-h6 max-value ml-2">
            /{{ model.total }}
          </div>
        </div>
      </div>
    </template>

    <v-list-item-title
      class="content"
      @click="click"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      {{ model.hitDiceSize }} {{ signedConMod }}
    </v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import numberToSignedString from '/imports/api/utility/numberToSignedString';

const props = defineProps<{
  model: Record<string, any>;
}>();

const emit = defineEmits(['click', 'change']);
const context = inject('context', {});

const hover = ref(false);

const signedConMod = computed(() => numberToSignedString(props.model.constitutionMod));

function click(e: Event) {
  emit('click', e);
}

function increment(value: number) {
  emit('change', { type: 'increment', value });
}
</script>

<style lang="css" scoped>
.hit-dice-list-tile {
  background: inherit;
}

.hit-dice-list-tile :deep(.v-list-item) {
  height: 88px;
}

.left {
  height: 100%;
}

.buttons {
  height: 100%;
}

.buttons>.v-btn {
  margin: 0;
}

.hit-dice-list-tile.hover {
  background: #f5f5f5 !important;
}

.v-theme--dark .hit-dice-list-tile.hover {
  background: #515151 !important;
}

.content {
  cursor: pointer;
}

.max-value {
  color: rgba(0, 0, 0, .54);
}

.v-theme--dark .max-value {
  color: rgba(255, 255, 255, 0.54);
}
</style>
