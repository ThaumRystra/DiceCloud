<template lang="html">
  <v-card>
    <v-list
      three-line
    >
      <v-list-item v-if="weaknesses.length">
        <v-list-item-content>
          <v-list-item-title>
            Vulnerabilities
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ weaknesses }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="resistances.length">
        <v-list-item-content>
          <v-list-item-title>
            Resistances
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ resistances }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="immunities.length">
        <v-list-item-content>
          <v-list-item-title>
            Immunities
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ immunities }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="js">

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
