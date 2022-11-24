<template lang="html">
  <v-btn
    :loading="loading"
    :disabled="context.editPermission === false"
    outlined
    style="width: 160px;"
    @click="rest"
  >
    <v-icon left>
      {{ type === 'shortRest' ? 'mdi-music-rest-quarter' : 'mdi-bed' }}
    </v-icon>
    {{ type === 'shortRest' ? 'Short Rest' : 'Long Rest' }}
  </v-btn>
</template>

<script lang="js">
import restCreature from '/imports/api/creature/creatures/methods/restCreature.js';

export default {
  inject: {
    context: { default: {} }
  },
  props:{
    type: {
      type: String,
      required: true,
    },
    creatureId: {
      type: String,
      required: true,
    },
  },
  data(){return {
    loading: false,
  }},
  methods: {
    rest(){
      this.loading = true;
      restCreature.call({
        creatureId: this.creatureId,
        restType: this.type,
      }, error => {
        this.loading = false;
        if (error){
          console.error(error);
        }
      });
    }
  }
}
</script>

<style lang="css" scoped>
</style>
