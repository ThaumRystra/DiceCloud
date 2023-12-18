<template lang="html">
  <v-combobox
    v-bind="$attrs"
    :loading="loading"
    :error-messages="errors"
    :value="safeValue"
    :menu-props="{auto: true, lazy: true}"
    :search-input.sync="searchInput"
    :disabled="isDisabled"
    :multiple="multiple"
    outlined
    @change="customChange"
    @focus="focused = true"
    @blur="focused = false"
  >
    <slot
      slot="prepend"
      name="prepend"
    />
  </v-combobox>
</template>

<script lang="js">
import SmartInput from '/imports/client/ui/components/global/SmartInputMixin';

export default {
  mixins: [SmartInput],
  props: {
    multiple: Boolean,
  },
  data() {
    return {
      searchInput: '',
    }
  },
  computed: {
    // Multiple combobox gets a long default debounce time while single
    // value gets a shorter one
    debounceTime() {
      if (Number.isFinite(this.debounce)) {
        return this.debounce;
      } else if (Number.isFinite(this.context.debounceTime)) {
        return this.context.debounceTime;
      } else {
        return this.multiple ? 1000 : 100;
      }
    },
  },
  methods: {
    customChange(val) {
      this.input(val);
      this.searchInput = '';
    },
  }
};
</script>
