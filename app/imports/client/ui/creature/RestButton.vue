<template lang="html">
  <v-btn
    :loading="loading"
    :disabled="context.editPermission === false"
    outlined
    :data-id="`rest-btn-${type}`"
    style="width: fit-content; min-width: 180px;"
    @click="rest"
  >
    <v-icon left>
      {{ type === 'shortRest' ? 'mdi-music-rest-quarter' : 'mdi-bed' }}
    </v-icon>
    {{ type === 'shortRest' ? $t('creature.restButton.shortRest') : $t('creature.restButton.longRest') }}
  </v-btn>
</template>

<script lang="js">
import doAction from '/imports/client/ui/creature/actions/doAction';

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
      doAction({
        creatureId: this.creatureId,
        $store: this.$store, 
        elementId: `rest-btn-${this.type}`, 
        task: {
          subtaskFn: 'reset',
          targetIds: [this.creatureId],
          eventName: this.type,
        },
      }).catch(e => {
        console.error(e);
      }).finally(() => {
        this.loading = false;
      });
    }
  }
}
</script>
