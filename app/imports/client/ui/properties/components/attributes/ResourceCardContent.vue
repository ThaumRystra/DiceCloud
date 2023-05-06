<template>
  <v-layout>
    <div class="buttons layout column justify-center pl-3">
      <smart-btn
        icon
        small
        :disabled="(optimisticValue >= model.total && !model.ignoreUpperLimit) || context.editPermission === false"
        @clicks="(times, ack) => increment(times, ack)"
        @click="optimisticIncrement += 1"
      >
        <v-icon>mdi-chevron-up</v-icon>
      </smart-btn>
      <smart-btn
        icon
        small
        :disabled="(optimisticValue <= 0 && !model.ignoreLowerLimit) || context.editPermission === false"
        @clicks="(times, ack) => increment(-1 * times, ack)"
        @click="optimisticIncrement -= 1"
      >
        <v-icon>mdi-chevron-down</v-icon>
      </smart-btn>
    </div>
    <div class="layout align-center value pl-2 pr-3">
      <div class="text-h4">
        {{ optimisticValue }}
      </div>
      <div
        v-if="model.total !== 0"
        class="text-h6 ml-2 max-value"
      >
        /{{ model.total }}
      </div>
    </div>
    <div
      class="content layout align-center pr-3"
      @click="click"
      @mouseover="$emit('mouseover')"
      @mouseleave="$emit('mouseleave')"
    >
      <div class="text-truncate ">
        {{ model.name }}
      </div>
    </div>
  </v-layout>
</template>

<script lang="js">

export default {
  inject: {
    context: { default: {} }
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    hover: {
      type: Boolean,
    }
  },
  data(){
    return {
      optimisticIncrement: 0,
    };
  },
  computed: {
    optimisticValue() {
      return this.model?.value + this.optimisticIncrement;
    },
  },
  watch: {
    'model.value'() {
      this.optimisticIncrement = 0;
    },
  },
  methods: {
    click(e) {
      this.$emit('click', e);
    },
    increment(value, ack) {
      this.$emit('change', { type: 'increment', value, ack })
    },
  },
};
</script>

<style lang="css" scoped>
.buttons,
.value {
  flex-shrink: 0;
  flex-grow: 0;
}
.buttons>.v-btn {
  margin: 0;
}
.content {
  cursor: pointer;
}
.max-value {
  color: rgba(0, 0, 0, .54);
}
.theme--dark .max-value {
  color: rgba(255, 255, 255, 0.54);
}
</style>