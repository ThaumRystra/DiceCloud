<template lang="html">
  <v-tooltip
    v-if="accessRights === 'reader' || accessRights === 'writer' || accessRights === 'public'"
    bottom
  >
    <template #activator="{ on }">
      <v-icon
        style="opacity: 0.4"
        v-on="on"
      >
        {{ accessIcon }}
      </v-icon>
    </template>
    <span>{{ accessText }}</span>
  </v-tooltip>
</template>

<script lang="js">
export default {
  props:{
    model: {
      type: Object,
      required: true,
    },
  },
  meteor:{
    accessRights(){
      let userId = Meteor.userId();
      if (this.model.owner === userId) return 'owner'
      else if (this.model.writers.includes(userId)) return 'writer';
      else if (this.model.readers.includes(userId)) return 'reader';
      else if (this.model.public) return 'public';
      else return 'denied'
    },
  },
  computed: {
    accessIcon() {
      switch (this.accessRights){
        case 'writer': return 'mdi-file-edit';
        case 'reader': return 'mdi-file-eye';
        case 'public': return 'mdi-cloud';
        default: return '';
      }
    },
    accessText(){
      switch (this.accessRights){
        case 'writer': return 'Shared with edit permission';
        case 'reader': return 'Shared as view-only';
        case 'public': return 'Shared publically';
        default: return '';
      }
    },
  }
}
</script>

<style lang="css" scoped>
</style>
