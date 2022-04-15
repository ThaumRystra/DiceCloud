<template lang="html">
  <log-component
    :logs="logs"
    :edit-permission="context.editPermission"
    show-name
    @submit="submit"
  />
</template>

<script lang="js">
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import insertTabletopLog from '/imports/api/creature/log/CreatureLogs.js';
import LogComponent from '/imports/ui/log/LogComponent.vue';

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
  meteor: {
    logs() {
      return CreatureLogs.find({
        tabletopId: this.tabletopId,
      }, {
        sort: {date: -1},
        limit: 50
      });
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
