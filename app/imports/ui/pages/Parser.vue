<template lang="html">
  <div class="layout column align-center justify-center pa-4">
    <v-card style="width: 100%; max-width: 400px;">
      <v-card-text>
        <v-text-field v-model="input" />
        <v-textarea
          v-model="output"
          readonly
          label="output"
        />
        <v-text-field
          v-model="string"
          readonly
          label="string"
        />
        <v-text-field
          v-model="compiled"
          readonly
          label="compiled"
        />
        <v-text-field
          v-model="rolled"
          readonly
          label="rolled"
        />
        <v-text-field
          v-model="reduced"
          readonly
          label="reduced"
        />
        <v-textarea
          v-model="reducedJson"
          readonly
          label="reduced"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import Parser from '/imports/parser/parser.js';
console.log(Parser);
export default {
  data(){return {
    input: null,
    output: null,
    compiled: null,
    string: null,
    rolled: null,
    reduced: null,
    reducedJson: null,
  }},
  watch: {
    input(val){
      this.output = this.compiled = this.string = '';
      let output = new Parser().feed(val).finish()[0];
      console.log(output);
      this.output = JSON.stringify(output, null, 2);
      if (!output) return;
      this.string = output;
      let scope = {cat: 1, dog: 2, mouse: 3};
      this.compiled = output.compile(scope);
      this.rolled = output.roll(scope);
      this.reduced = output.reduce(scope);
      this.reducedJson = JSON.stringify(this.reduced, null, 2)
    }
  },
}
</script>

<style lang="css" scoped>
</style>
