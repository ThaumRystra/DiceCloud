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
  }},
  watch: {
    input(val){
      this.output = this.compiled = this.string = '';
      let output = new Parser().feed(val).finish()[0];
      console.log(output);
      this.output = JSON.stringify(output, null, 2);
      if (!output) return;
      this.string = output;
      this.compiled = output.compile();
    }
  },
}
</script>

<style lang="css" scoped>
</style>
