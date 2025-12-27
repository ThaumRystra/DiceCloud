<template lang="html">
  <outlined-input
    :name="label"
    class="mb-6 pt-1"
  >
    <v-btn-toggle
      v-bind="$attrs"
      mandatory
      tile
      group
      :value="safeValue"
      color="accent"
      style="flex-wrap: wrap;"
    >
      <v-btn
        v-for="(option, i) in options"
        :key="`toggle-option-${i}`"
        :value="option.value"
        :disabled="isDisabled || (clickedValue != option.value && loading)"
        :plain="clickedValue != option.value && loading"
        :loading="clickedValue == option.value && loading"
        height="42"
        v-on="(value == option.value) ? {} : { click() { click(option.value) } }"
      >
        <v-icon
          v-if="option.icon && option.icon.startsWith('mdi-')"
          left
        >
          {{ option.icon }}
        </v-icon>
        <span
          v-else-if="option.icon"
          class="mr-2"
          style="font-size: 1.2em;"
        >{{ option.icon }}</span>
        {{ option.name }}
      </v-btn>
    </v-btn-toggle>
    <v-expand-transition>
      <div
        v-if="errors.length"
        class="pa-2 error--text"
      >
        {{ errors.join('\n\n') }}
      </div>
    </v-expand-transition>
  </outlined-input>
</template>

<script lang="js">
import SmartInput from '/imports/client/ui/components/global/SmartInputMixin';
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';

export default {
  components: {
    OutlinedInput,
  },
  mixins: [SmartInput],
  props: {
    label: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      clickedValue: undefined,
    };
  },
  methods: {
    click(val) {
      this.clickedValue = val;
      this.change(val);
    },
  }
};
</script>
