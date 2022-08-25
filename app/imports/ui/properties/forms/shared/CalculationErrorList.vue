<template lang="html">
  <div
    v-if="computedErrors.length"
    class="error-list"
  >
    <v-slide-x-transition
      group
      hide-on-leave
    >
      <v-alert
        v-for="error in computedErrors"
        :key="error.message"
        :value="true"
        :icon="errorIcon(error.type)"
        :color="errorColor(error.type)"
        class="mb-2"
        dense
        text
      >
        <pre>{{ error.message }}</pre>
      </v-alert>
    </v-slide-x-transition>
  </div>
</template>

<script lang="js">
export default {
  props: {
    errors: {
      type: Array,
      default: undefined,
    },
    calculations: {
      type: Array,
      default: undefined,
    },
  },
  computed: {
    computedErrors(){
      if (this.errors) {
        return this.errors;
      } else if (this.calculations){
        let errors = [];
        this.calculations.forEach(calc => {
          if (calc.errors) errors.push(...calc.errors)
        });
        return errors;
      } else {
        return [];
      }
    },
  },
  methods: {
    errorIcon(type){
      if (type === 'subsitution'){
        return 'mdi-information';
      } else if (type === 'evaluation'){
        return 'mdi-alert-circle';
      } else {
        return 'mdi-alert'
      }
    },
    errorColor(type){
      if (type === 'subsitution'){
        return 'info';
      } else if (type === 'evaluation'){
        return 'warning';
      } else {
        return 'error'
      }
    },
  }
}
</script>

<style lang="css">
.error-list .v-alert__content{
  overflow-x: auto;
}
</style>
