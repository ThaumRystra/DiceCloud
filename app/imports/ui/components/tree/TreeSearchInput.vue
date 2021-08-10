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
export default {
  props: {
    value: {
      type: Object,
      default: undefined,
    },
  },
  data(){return {
    filterTerms: [],
    filterOptions: [
      {text: 'Actions', value: 'action'},
      {text: 'Attacks', value: 'attack'},
      {text: 'Attributes', value: 'attribute'},
      {text: 'Buffs', value: 'buff'},
      {text: 'Class Levels', value: 'classLevel'},
      {text: 'Damage Multipliers', value: 'damageMultiplier'},
      {text: 'Effects', value: 'effect'},
      {text: 'Experiences', value: 'experience'},
      {text: 'Features', value: 'feature'},
      {text: 'Folders', value: 'folder'},
      {text: 'Notes', value: 'note'},
      {text: 'Proficiencies', value: 'proficiency'},
      {text: 'Rolls', value: 'roll'},
      {text: 'Saving Throws', value: 'savingThrow'},
      {text: 'Skills', value: 'skill'},
      {text: 'Spell Lists', value: 'spellList'},
      {text: 'Spells', value: 'spell'},
      {text: 'Containers', value: 'container'},
      {text: 'Items', value: 'item'},
    ],
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
