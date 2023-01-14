<template lang="html">
  <log-component
    :creature-id="tabletopId"
  />
</template>

<script lang="js">
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import insertTabletopLog from '/imports/api/creature/log/CreatureLogs.js';
import LogComponent from '/imports/client/ui/log/CharacterLog.vue';

export default {
  components: {
    LogComponent,
  },
  inject: {
    context: {
      default: {},
    },
  },
  props: {
    tabletopId: {
      type: String,
      required: true,
    },
  },
  methods: {
    submit(){
      insertTabletopLog.call({
        content: this.logContent,
        tabletopId: this.tabletopId,
      }, (error) => {
        if (error) console.error(error);
      });
    },
  },
}
</script>

<style lang="css" scoped>
</style>
