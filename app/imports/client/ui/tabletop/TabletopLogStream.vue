<template lang="html">
  <div
    class="d-flex flex-column-reverse"
    style="overflow: auto;"
  >
    <tabletop-log-stream-entry
      v-for="log in logs"
      :key="log._id"
      class="stream-entry"
      :class="{'hidden': hideAction(log.actionId)}"
      :model="log"
    />
  </div>
</template>

<script lang="js">
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import TabletopLogStreamEntry from '/imports/client/ui/tabletop/TabletopLogStreamEntry.vue';
import dialogStackStore from '/imports/client/ui/dialogStack/dialogStackStore.js';

export default {
  components: {
    TabletopLogStreamEntry,
  },
  props: {
    tabletopId: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    openActionDialogs(){
      const dialogs = this.$store.state.dialogStack.dialogs;
      return new Set(dialogs.map(dialog => dialog.data?.actionId).filter(actionId => !!actionId));
    },
  },
  methods: {
    hideAction(actionId){
      return this.openActionDialogs.has(actionId);
    },
  },
  meteor: {
    logs() {
      const filter = {};
      if (this.tabletopId) {
        filter.tabletopId = this.tabletopId;
      } else if (this.creatureId) {
        filter.creatureId = this.creatureId;
      }
      return CreatureLogs.find(filter, {
        sort: {date: -1},
        limit: 100
      });
    },
  },
}
</script>

<style lang="css" scoped>
.stream-entry {
  background-color: hsl(0deg 0% 50% / 0.05);
  border-radius: 2px;
}

.hidden {
  opacity: 0;
}
</style>
