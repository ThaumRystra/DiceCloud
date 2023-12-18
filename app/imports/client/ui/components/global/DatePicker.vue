<template lang="html">
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    lazy
    transition="scale-transition"
    full-width
    min-width="290px"
  >
    <template #activator="{ on }">
      <v-text-field
        :value="formattedSafeValue"
        v-bind="$attrs"
        prepend-icon="mdi-calendar"
        readonly
        :loading="loading"
        :error-messages="errors"
        :disabled="isDisabled"
        outlined
        v-on="on"
        @focus="focused = true"
        @blur="focused = false"
      />
    </template>
    <v-date-picker
      :value="formattedSafeValue"
      @input="dateInput"
    />
  </v-menu>
</template>

<script lang="js">
import SmartInput from '/imports/client/ui/components/global/SmartInputMixin';
import { format } from 'date-fns';

export default {
  mixins: [SmartInput],
  data() {
    return {
      menu: false,
    };
  },
  computed: {
    formattedSafeValue() {
      return format(this.safeValue, 'YYYY-MM-DD')
    },
  },
  methods: {
    dateInput(e) {
      this.menu = false;
      this.input(e);
    },
  },
}
</script>

<style lang="css" scoped>

</style>
