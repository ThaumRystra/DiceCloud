<template lang="html">
  <v-tooltip
    v-if="accessRights === 'reader' || accessRights === 'writer'"
    bottom
  >
    <template #activator="{ on }">
      <v-icon
        style="opacity: 0.4"
        v-on="on"
      >
        {{ accessRights === 'reader' ? 'mdi-file-eye' : 'mdi-file-edit' }}
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
    accessText(){
      switch (this.accessRights){
        case 'writer': return 'Shared with edit permission';
        case 'reader': return 'Shared as view-only';
        case 'public': return 'Shared as publicly viewable';
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
