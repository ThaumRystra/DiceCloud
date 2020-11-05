<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Build
    </v-toolbar-title>
    <slots
      :creature-id="creatureId"
      show-hidden-slots
    />
  </dialog-base>
</template>

<script>
import Creatures from '/imports/api/creature/Creatures.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import Slots from '/imports/ui/creature/slots/Slots.vue'

export default {
  components: {
    DialogBase,
    Slots,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  reactiveProvide: {
    name: 'context',
    include: ['creature'],
  },
  meteor: {
    creature(){
      return Creatures.findOne(this.creatureId);
    },
  }
}
</script>

<style lang="css" scoped>
</style>
