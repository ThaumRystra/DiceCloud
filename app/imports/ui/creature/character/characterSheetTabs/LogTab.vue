<template lang="html">
  <div class="log layout column reverse">
    <div
      v-for="log in logs"
      :key="log._id"
    >
      {{ log.text }}
    </div>
  </div>
</template>

<script>
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';

export default {
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  meteor: {
    logs(){
      return CreatureLogs.find({
        creatureId: this.creatureId,
      }, {
        limit: 20,
        sort: {date: -1},
      });
    },
  },
}
</script>

<style lang="css" scoped>
</style>
