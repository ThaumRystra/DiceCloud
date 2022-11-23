<template>
  <v-layout
    align-center
    justify-center
    class="increment-menu"
  >
    <v-spacer />
    <v-btn-toggle
      :value="operation === 'add' ? 0: operation === 'subtract' ? 1 : null"
      class="mx-2"
      @click="$refs.editInput.focus()"
    >
      <v-btn
        :disabled="context.editPermission === false"
        class="filled"
        @click="toggleAdd(); $nextTick(() => $refs.editInput.focus())"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        :disabled="context.editPermission === false"
        class="filled"
        @click="toggleSubtract(); $nextTick(() => $refs.editInput.focus())"
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
  </v-layout>
</template>

<script lang="js">
export default {
  inject: {
    context: { default: {} }
  },
  props: {
    value: {
      type: Number,
      default: 0,
    },
    open: Boolean,
    flat: Boolean,
  },
  data() {
    return {
      editValue: this.value,
      operation: 'set',
      hover: false,
    };
  },
  watch: {
    open: {
      immediate: true,
      handler(isOpen) {
        if (isOpen) this.resetData();
      },
    },
  },
  methods: {
    resetData() {
      this.editValue = this.value;
      this.operation = 'set';
      // this.$nextTick didn't work, using timeout instead did
      setTimeout(() => {
        if (this.$refs.editInput) {
          this.$refs.editInput.focus();
        }
      }, 100);
    },
    cancelEdit() {
      this.$emit('close');
    },
    commitEdit() {
      this.editing = false;
      let value = +this.$refs.editInput.lazyValue;
      if (this.operation === 'add') {
        value = -value;
      }
      let type = this.operation === 'set' ? 'set' : 'increment';
      this.$emit('change', { type, value });
    },
    operationIcon(operation) {
      switch (operation) {
        case 'set':
          return 'mdi-forward';
        case 'add':
          return 'mdi-plus';
        case 'subtract':
          return 'mdi-minus';
      }
    },
    toggleAdd() {
      this.operation = (this.operation === 'add') ? 'set' : 'add';
    },
    toggleSubtract() {
      this.operation = (this.operation === 'subtract') ? 'set' : 'subtract';
    },
    keypress(event) {
      let digitsOnly = /[0-9]/;
      let key = event.key;
      if (key === '+') {
        this.toggleAdd();
        event.preventDefault();
      } else if (key === '-') {
        this.toggleSubtract();
        event.preventDefault();
      } else if (key === 'Enter') {
        this.commitEdit();
      } else if (!digitsOnly.test(key)) {
        event.preventDefault();
      }
    },
    input(value) {
      if (+value < 0) {
        this.editValue = -value;
        this.operation = 'subtract';
      }
    }
  }
};
</script>

<style scoped>
.filled.theme--light {
  background: #fff !important;
}

.filled.theme--dark {
  background: #424242 !important;
}
</style>
