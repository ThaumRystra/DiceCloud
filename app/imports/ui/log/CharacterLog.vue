<template lang="html">
  <log-component
    :logs="logs"
    :edit-permission="editPermission"
    @submit="submit"
  />
</template>

<script lang="js">
import CreatureLogs, { logRoll } from '/imports/api/creature/log/CreatureLogs.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import LogComponent from '/imports/ui/log/LogComponent.vue';

export default {
  components: {
    LogComponent,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  methods: {
    submit(input){
      logRoll.call({
        roll: input,
        creatureId: this.creatureId,
      }, (error) => {
        if (error) console.error(error);
      });
    },
  },
  meteor: {
    logs(){
      return CreatureLogs.find({
        creatureId: this.creatureId,
      }, {
        sort: {date: -1},
        limit: 20
      });
    },
    creature(){
      return Creatures.findOne(this.creatureId) || {};
    },
    editPermission(){
      try {
        assertEditPermission(this.creature, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
  },
}
</script>

<style lang="css">
  .log-tab p:last-child {
    margin-bottom: 0;
  }
</style>
