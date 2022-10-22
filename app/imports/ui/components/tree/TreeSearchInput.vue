<template lang="html">
  <v-combobox
    v-model="filterTerms"
    :items="filterOptions"
    prepend-inner-icon="mdi-magnify"
    hide-no-data
    hide-selected
    multiple
    clearable
    small-chips
    deletable-chips
  />
</template>

<script lang="js">
import PROPERTIES from '/imports/constants/PROPERTIES.js';
const filterOptions = [];
for (let key in PROPERTIES) {
  if (key === 'reference') continue;
  filterOptions.push({
    text: PROPERTIES[key].name,
    value: key,
  });
}

export default {
  props: {
    value: {
      type: Object,
      default: undefined,
    },
  },
  data(){return {
    filterTerms: [],
    filterOptions,
  }},
  computed: {
    filter(){
      if (!this.filterTerms.length) return;
      let typeFilters = [];
      let nameFilters = [];
      this.filterTerms.forEach(filter => {
        if (filter.value){
          typeFilters.push(filter.value);
        } else {
          // escape string
          let term = filter.replace( /[-/\\^$*+?.()|[\]{}]/g, '\\$&' );
          var reg = new RegExp( '.*' + term + '.*', 'i' );
          nameFilters.push(reg)
        }
      });
      let filter = {};
      if (typeFilters.length){
        filter.type = {$in: typeFilters};
      }
      if (nameFilters.length){
        filter.name = {$in: nameFilters};
      }
      return filter;
    },
  },
  watch:{
    filter(value){
      this.$emit('input', value);
    }
  }
}
</script>

<style lang="css" scoped>
</style>
