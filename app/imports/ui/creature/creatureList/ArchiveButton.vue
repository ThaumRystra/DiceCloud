<template lang="html">
  <v-btn
    :icon="!text"
    :text="text"
    :data-id="randomId"
    v-bind="$attrs"
    @click="openArchive"
  >
    <template v-if="text">
      Archive Characters
    </template>
    <v-icon :right="text">
      mdi-archive
    </v-icon>
  </v-btn>
</template>

<script lang="js">
export default {
  props: {
    text: Boolean,
  },
  data(){return {
    randomId: Random.id(),
  }},
  methods: {
    openArchive(){
      this.$store.commit('pushDialogStack', {
        component: 'archive-dialog',
        elementId: this.randomId,
      });
    }
  }
}
</script>

<style lang="css" scoped>
</style>
