<template>
  <div>
    <v-text-field
      ref="input"
      v-bind="$attrs"
      class="dc-text-field"
      :loading="loading"
      :error-messages="errors"
      :value="safeValue"
      :disabled="isDisabled"
      :outlined="!regular"
      @input="input"
      @focus="focused = true"
      @blur="focused = false"
      @keyup="e => $emit('keyup', e)"
    >
      <template #append>
        <slot name="value" />
      </template>
      <template #prepend>
        <slot name="prepend" />
      </template>
      <template #append-inner>
        <input
          type="file"
          @change="handleFileChange"
          @dragover="handleDragOver"
          @drop="handleDrop"
        >
      </template>
    </v-text-field>
    <input
      v-model="url"
      type="text"
      @change="handleUrlChange"
    >
  </div>
</template>

<script lang="js">
import SmartInput from '/imports/client/ui/components/global/SmartInputMixin';

export default {
  mixins: [SmartInput],
  data() {
    return {
      url: '',
    };
  },
  methods: {
    handleUrlChange() {
      this.$emit('change', this.url);
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      this.uploadFile(file);
    },
    handleDragOver(event) {
      event.preventDefault();
    },
    handleDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      this.uploadFile(file);
    },
    uploadFile(file) {
      // Implement your file upload logic here
    },
  },
};
</script>