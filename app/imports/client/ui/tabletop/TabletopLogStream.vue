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

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import TabletopLogStreamEntry from '/imports/client/ui/tabletop/TabletopLogStreamEntry.vue';

const props = defineProps<{
  tabletopId?: string;
}>();

const store = useStore();

const openActionDialogs = computed(() => {
  const dialogs = store.state.dialogStack.dialogs;
  return new Set(dialogs.map((dialog: any) => dialog.data?.actionId).filter((actionId: any) => !!actionId));
});

function hideAction(actionId: string) {
  return openActionDialogs.value.has(actionId);
}

const { result: logs } = autorun(() => {
  const filter: any = {};
  if (props.tabletopId) filter.tabletopId = props.tabletopId;
  return CreatureLogs.find(filter, { sort: { date: -1 }, limit: 100 });
});
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
