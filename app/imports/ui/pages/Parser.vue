<template lang="html">
  <div class="layout column align-center justify-center pa-4">
    <v-card style="width: 100%; max-width: 400px;">
      <v-card-text>
        <v-text-field
          v-model="input"
          label="input"
        />
        <v-btn
          icon
          @click="recompute"
        >
          <v-icon>refresh</v-icon>
        </v-btn>
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
        <v-textarea
          :value="contextJSON"
          readonly
          label="reduced"
        />
        <function-reference />
        <v-dialog
          width="500"
        >
          <template #activator="{ on }">
            <v-btn
              color="red lighten-2"
              dark
              v-on="on"
            >
              Click Me
            </v-btn>
          </template>
          <check :bonus="4" />
        </v-dialog>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { parse, CompilationContext } from '/imports/parser/parser.js';
import FunctionReference from '/imports/ui/documentation/FunctionReference.vue';
import Check from '/imports/ui/components/rolls/Check.vue';
console.log(parse);
export default {
  components: {
    FunctionReference,
    Check,
  },
  data(){return {
    input: null,
    output: null,
    compiled: null,
    string: null,
    rolled: null,
    reduced: null,
    reducedJson: null,
    context: null,
  }},
  computed: {
    contextJSON(){
      return JSON.stringify(this.context, null, 2);
    }
  },
  watch: {
    input(){
      this.recompute();
    }
  },
  methods: {
    recompute(){
      let val = this.input;
      this.output = this.compiled = this.string = '';
      let output = parse(val);
      console.log(output);
      this.output = JSON.stringify(output, null, 2);
      if (!output) return;
      this.string = output;
      let scope = {strength: {value: 16}, hitpoints: {value: 32, currentValue: 8}, mouse: 3};
      this.context = new CompilationContext();
      this.compiled = output.compile(scope, this.context);
      this.rolled = this.compiled.roll(scope, this.context);
      this.reduced = this.rolled.reduce(scope, this.context);
      this.reducedJson = JSON.stringify(this.reduced, null, 2)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
