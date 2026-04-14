<script setup lang="ts">
import { ref } from 'vue';
import IncrementMenu from '/imports/client/ui/components/IncrementMenu.vue';

defineProps<{
  value: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  change: [e: unknown];
}>();

const open = ref(false);

function changeIncrementMenu(e: unknown) {
  emit('change', e);
  open.value = false;
}
</script>

<template lang="html">
  <v-menu
    v-model="open"
    origin="center center"
    transition="scale-transition"
    :offset="130"
    :min-width="305"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="{...$attrs, ...props}"
        :loading="loading"
        @click.stop
      >
        <slot>
          <v-icon>$vuetify.icons.abacus</v-icon>
        </slot>
      </v-btn>
    </template>
    <v-card>
      <increment-menu
        flat
        :value="value"
        :open="open"
        @change="changeIncrementMenu"
        @close="open = false"
      />
    </v-card>
  </v-menu>
</template>

<style lang="css" scoped>
</style>
