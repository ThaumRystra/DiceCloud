<template lang="html">
  <character-log
    :tabletop-id="tabletopId"
    :creature-id="activeCreatureId"
  />
</template>

<script lang="js">
import { insertTabletopLog } from '/imports/api/creature/log/CreatureLogs.js';
import CharacterLog from '/imports/client/ui/log/CharacterLog.vue';

export default {
  components: {
    CharacterLog,
  },
  inject: {
    context: {
      default: {},
    },
  },
  props: {
    tabletopId: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      activeCreatureId: undefined,
    }
  },
  mounted() {
    this.$root.$on('active-tabletop-character-change', (id) => {
      this.activeCreatureId = id;
    });
  },
}
</script>

<style lang="css" scoped>
</style>
