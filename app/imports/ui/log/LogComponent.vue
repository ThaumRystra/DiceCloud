<template lang="html">
  <div
    style="height: 100%; overflow: hidden;"
    class="character-log layout column justify-end"
  >
    <v-slide-y-reverse-transition
      group
      hide-on-leave
      class="card-raised-background flex layout column reverse align-end pa-3"
      style="overflow: auto;"
    >
      <log-entry
        v-for="log in logs"
        :key="log._id"
        :model="log"
        :show-name="showName"
      />
    </v-slide-y-reverse-transition>
    <v-card>
      <v-text-field
        v-model="input"
        class="mx-2 mb-2"
        persistent-hint
        style="flex-grow: 0"
        append-outer-icon="mdi-send"
        :hint="inputHint"
        :error-messages="inputError"
        :disabled="!editPermission"
        @click:append-outer="submit"
        @keyup.enter="submit"
      />
    </v-card>
  </div>
</template>

<script lang="js">
import LogEntry from '/imports/ui/log/LogEntry.vue';
import { parse, prettifyParseError } from '/imports/parser/parser.js';
import resolve, { toString } from '/imports/parser/resolve.js';

export default {
  components: {
    LogEntry,
  },
  props: {
    logs: {
      type: Array,
      required: true,
    },
    editPermission: Boolean,
    showName: Boolean,
  },
  data(){return {
    inputHint: undefined,
    inputError: undefined,
    input: undefined,
  }},
  watch: {
    input(value){
      this.input = value;
      this.inputHint = this.inputError = undefined;
      if (!this.input) return;
      let result;
      try {
        result = parse(value);
      } catch (e){
        if (e.constructor.name === 'EndOfInputError'){
          this.inputError = '...';
        } else {
          let error = prettifyParseError(e);
          this.inputError = error;
        }
        return;
      }
      try {
        let {result: compiled} = resolve('compile', result, this.creature.variables);
        this.inputHint = toString(compiled);
        return;
      } catch (e){
        console.warn(e);
        this.inputError = 'Compilation error';
        return;
      }
    },
  },
  methods: {
    submit(){
      if (this.inputError || !this.input) return;
      this.$emit('submit', this.input);
      this.input = '';
    },
  },
}

</script>

<style lang="css" scoped>
</style>
