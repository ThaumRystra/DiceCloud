<template lang="html">
  <dialog-base>
    <div>
      TODO
    </div>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      @click="$store.dispatch('popDialogStack')"
    >
      Done
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';

export default {
  components: {
    DialogBase,
  },
}
</script>

<style lang="css" scoped>
</style>
