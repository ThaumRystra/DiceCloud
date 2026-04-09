<template>
  <div
    class="d-flex align-center justify-center increment-menu"
  >
    <v-spacer />
    <v-btn-toggle
      :model-value="operation === 'add' ? 0: operation === 'subtract' ? 1 : null"
      class="mx-2"
      @click="editInput?.focus()"
    >
      <v-btn
        :disabled="context.editPermission === false"
        class="filled"
        @click="toggleAdd(); $nextTick(() => editInput?.focus())"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        :disabled="context.editPermission === false"
        class="filled"
        @click="toggleSubtract(); $nextTick(() => editInput?.focus())"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
    </v-btn-toggle>
    <v-text-field
      ref="editInput"
      :solo="!flat"
      :class="flat && 'ma-0 pa-0'"
      hide-details
      type="number"
      style="max-width: 120px;"
      min="0"
      :value="editValue"
      :prepend-inner-icon="operationIcon(operation)"
      :disabled="context.editPermission === false"
      @focus="$event.target.select()"
      @keypress="keypress"
      @input="input"
    />
    <v-btn
      :small="!flat"
      :fab="!flat"
      :text="flat"
      :icon="flat"
      class="mx-2 filled"
      @click="commitEdit"
    >
      <v-icon>mdi-check</v-icon>
    </v-btn>
    <v-btn
      :small="!flat"
      :fab="!flat"
      :text="flat"
      :icon="flat"
      class="filled"
      @click="cancelEdit"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-spacer />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject, nextTick } from 'vue';

const context = inject<{ editPermission?: boolean; debounceTime?: number }>('context', {});

const props = defineProps<{
  value?: number;
  open?: boolean;
  flat?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  change: [payload: { type: string; value: number }];
}>();

const editInput = ref<{ focus: () => void; lazyValue?: string } | null>(null);
const editValue = ref(props.value ?? 0);
const operation = ref<'set' | 'add' | 'subtract'>('set');

watch(() => props.open, (isOpen) => {
  if (isOpen) resetData();
}, { immediate: true });

function resetData() {
  editValue.value = props.value ?? 0;
  operation.value = 'set';
  setTimeout(() => {
    editInput.value?.focus();
  }, 100);
}

function cancelEdit() {
  emit('close');
}

function commitEdit() {
  let value = +(editInput.value?.lazyValue ?? editValue.value);
  if (operation.value === 'add') {
    value = -value;
  }
  const type = operation.value === 'set' ? 'set' : 'increment';
  emit('change', { type, value });
}

function operationIcon(op: string): string {
  switch (op) {
    case 'set': return 'mdi-forward';
    case 'add': return 'mdi-plus';
    case 'subtract': return 'mdi-minus';
    default: return '';
  }
}

function toggleAdd() {
  operation.value = (operation.value === 'add') ? 'set' : 'add';
}

function toggleSubtract() {
  operation.value = (operation.value === 'subtract') ? 'set' : 'subtract';
}

function keypress(event: KeyboardEvent) {
  const digitsOnly = /[0-9]/;
  const key = event.key;
  if (key === '+') {
    toggleAdd();
    event.preventDefault();
  } else if (key === '-') {
    toggleSubtract();
    event.preventDefault();
  } else if (key === 'Enter') {
    commitEdit();
  } else if (!digitsOnly.test(key)) {
    event.preventDefault();
  }
}

function input(value: string) {
  if (+value < 0) {
    editValue.value = -Number(value);
    operation.value = 'subtract';
  }
}
</script>

<style scoped>
.filled.v-theme--light {
  background: #fff !important;
}

.filled.v-theme--dark {
  background: #424242 !important;
}
</style>
