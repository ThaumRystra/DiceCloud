<template lang="html">
  <div>
    <div
      v-for="fn in functions"
      :key="fn.name"
      class="mb-3"
    >
      <h3>{{ fn.name }}</h3>
      <div class="my-2">
        {{ fn.comment }}
      </div>
      <table>
        <tr
          v-for="example in fn.examples"
          :key="example.input"
        >
          <td>
            <code>{{ example.input }}</code>
          </td>
          <td>
            <v-icon>arrow_right_alt</v-icon>
          </td>
          <td>
            <code>{{ example.result }}</code>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import functions from '/imports/parser/functions.js';
export default {
  computed:{
    functions(){
      let fns = [];
      for (let name in functions){
        let f = functions[name];
        fns.push({name, ...f});
      }
      return fns;
    }
  }
}
</script>

<style lang="css" scoped>
</style>
