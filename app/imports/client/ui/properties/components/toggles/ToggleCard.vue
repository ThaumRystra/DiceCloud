<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue';
import flipToggle from '/imports/api/creature/creatureProperties/methods/flipToggle';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';

const props = defineProps<{
  model: Record<string, any>;
}>();

const emit = defineEmits(['click']);
const attrs = useAttrs();
const hover = ref(false);

const hasClickListener = computed(() => !!attrs.onClick);

const toggleValue = computed(() => {
  if (props.model.enabled) return true;
  if (props.model.disabled) return false;
  if (!props.model.condition) return undefined;
  return !!props.model.condition.value;
});

const toggleDisabled = computed(() => !props.model.enabled && !props.model.disabled);

function click(e: Event) {
  emit('click', e);
}

async function toggleToggle(value: boolean, ack?: Function) {
  try {
    await flipToggle.callAsync({ _id: props.model._id });
    if (ack) ack();
  } catch (error: any) {
    console.warn(error);
    if (ack) ack(error.reason || error);
  }
}
</script>

<template lang="html">
  <v-card
    :class="hover ? 'elevation-8': ''"
    @click="click"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <div class="d-flex align-center">
      <div
        class="value layout justify-center flex-grow-0"
      >
        <smart-checkbox
          :value="toggleValue"
          :disabled="toggleDisabled"
          @change="(val, ack) => toggleToggle(val, ack)"
          @click.stop=""
        />
      </div>
      <v-card-title class="name text-subtitle-1 text-truncate d-block pl-0">
        {{ model.name }}
      </v-card-title>
    </div>
    <card-highlight :active="hover" />
  </v-card>
</template>

<style lang="css" scoped>
  .value {
    min-width: 64px;
    justify-content: center;
  }
</style>
