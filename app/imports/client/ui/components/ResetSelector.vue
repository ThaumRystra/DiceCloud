<template>
  <smart-select
    label="Reset"
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
          text: 'Short rest',
          value: 'shortRest',
        }, {
          text: 'Long rest',
          value: 'longRest',
        }
      ];
      return [...defaultEvents, ...eventActions];
    },
  },
}
</script>
