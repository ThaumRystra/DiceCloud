<template lang="html">
  <v-btn
    :loading="loading"
    :disabled="context.editPermission === false"
    outlined
    :data-id="`rest-btn-${type}`"
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
      const emptyProp = {
        _id: this.creatureId,
        root: { id: this.creatureId },
      };
      doAction(emptyProp, this.$store, `rest-btn-${this.type}`, {
        subtaskFn: 'reset',
        prop: emptyProp,
        targetIds: [this.creatureId],
        eventName: this.type,
      }).catch(e => {
        console.error(e);
      }).finally(() => {
        this.loading = false;
      });
    }
  }
}
</script>
