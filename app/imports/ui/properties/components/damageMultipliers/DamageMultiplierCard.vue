<template lang="html">
  <v-card>
    <v-list
      three-line
    >
      <v-list-tile v-if="weaknesses.length">
        <v-list-tile-content>
          <v-list-tile-title>
            Vulnerabilities
          </v-list-tile-title>
          <v-list-tile-sub-title>
            {{ weaknesses }}
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile v-if="resistances.length">
        <v-list-tile-content>
          <v-list-tile-title>
            Resistances
          </v-list-tile-title>
          <v-list-tile-sub-title>
            {{ resistances }}
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile v-if="immunities.length">
        <v-list-tile-content>
          <v-list-tile-title>
            Immunities
          </v-list-tile-title>
          <v-list-tile-sub-title>
            {{ immunities }}
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-card>
</template>

<script>

export default {
  props: {
    model:{
      type: Object,
      required: true,
    }
  },
  computed: {
    weaknesses(){
      return getKeysOfValue(this.model, 2).join(', ');
    },
    resistances(){
      return getKeysOfValue(this.model, 0.5).join(', ');
    },
    immunities(){
      return getKeysOfValue(this.model, 0).join(', ');
    },
  }
}

function getKeysOfValue(object, value){
  let keys = [];
  for (let key in object){
    if (object[key] === value){
      keys.push(key);
    }
  }
  return keys;
}
</script>

<style lang="css" scoped>
</style>
