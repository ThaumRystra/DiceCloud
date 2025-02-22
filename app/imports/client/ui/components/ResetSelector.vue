<template>
  <smart-select
    :label="$t('ResetSelector.i6eGWDKtSDJDxSkvSA9bB')"
    clearable
    style="flex-basis: 300px;"
    :hint="hint"
    :items="resetOptions"
    :value="value"
    :error-messages="errorMessages"
    :menu-props="{auto: true, lazy: true}"
    @change="(value, ack) => $emit('change', value, ack)"
  />
</template>

<script lang="js">
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';

export default {
  props: {
    value: [String, Number, Date, Array, Object, Boolean],
    errorMessages: [String, Array],
    hint: {
      type: String,
      default: undefined,
    }
  },
  meteor: {
    resetOptions() {
      const eventActions = createListOfProperties({
        type: 'action',
        actionType: 'event',
      }, true);
      const defaultEvents = [
        {
          text: this.$t('ResetSelector.kWVeEgn9xE3ttsd7ywkDb'),
          value: 'shortRest',
        }, {
          text: this.$t('ResetSelector.qGXvcPldmk5aYt86yPZL-'),
          value: 'longRest',
        }
      ];
      return [...defaultEvents, ...eventActions];
    },
  },
}
</script>
