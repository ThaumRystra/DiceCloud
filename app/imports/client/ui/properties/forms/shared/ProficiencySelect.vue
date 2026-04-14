<script setup lang="ts">
import { ref, watch } from 'vue';
import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon';

const ICON_SPIN_DURATION = 300;

const props = withDefaults(defineProps<{
  value?: number;
  clearable?: boolean;
}>(), {
  value: undefined,
  clearable: true,
});

const values = [
  { value: 1, text: 'Proficient' },
  { value: 0.49, text: 'Half proficiency bonus rounded down' },
  { value: 0.5, text: 'Half proficiency bonus rounded up' },
  { value: 2, text: 'Double proficiency bonus' },
];

const displayedIcon = ref('mdi-radiobox-blank');
const iconClass = ref('');

watch(() => props.value, (newValue) => {
  const newIcon = getProficiencyIcon(newValue);
  iconClass.value = 'leaving';
  setTimeout(() => {
    displayedIcon.value = newIcon;
    iconClass.value = 'arriving';
    requestAnimationFrame(() => {
      iconClass.value = '';
    });
  }, ICON_SPIN_DURATION / 2);
}, { immediate: true });
</script>

<template lang="html">
  <smart-select
    append-icon="mdi-menu-down"
    :clearable="clearable"
    class="ml-3"
    v-bind="$attrs"
    :menu-props="{transition: 'slide-y-transition', lazy: true}"
    :items="values"
    :value="value"
    @change="(value, ack) => $emit('change', value, ack)"
  >
    <template #prepend>
      <v-icon
        class="icon"
        :class="iconClass"
      >
        {{ displayedIcon }}
      </v-icon>
    </template>
  </smart-select>
</template>

<style lang="css" scoped>
  .v-theme--light .icon {
    color: black;
  }
  .icon {
    min-width: 30px;
    transition: transform 0.15s linear, opacity 0.15s ease;
    transform-origin: 18px center;
    margin-left: -12px;
  }
  .icon.leaving {
    transform: translateY(-24px);
    opacity: 0;
  }
  .icon.arriving {
    transform: translateY(24px);
    opacity: 0;
    transition: none;
  }
  .hidden {
    visibility: hidden;
  }
</style>
