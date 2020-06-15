<template lang="html">
  <v-btn
    :loading="loading"
    outline
    style="width: 160px;"
    @click="rest"
  >
    <v-icon left>
      {{ type === 'shortRest' ? 'snooze' : 'bedtime' }}
    </v-icon>
    {{ type === 'shortRest' ? 'Short Rest' : 'Long Rest' }}
  </v-btn>
</template>

<script>
import restCreature from '/imports/api/creature/restCreature.js';

export default {
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
