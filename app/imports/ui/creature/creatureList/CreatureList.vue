<template lang="html">
  <v-list>
    <draggable
      v-model="dataCreatures"
      style="min-height: 24px;"
      :sort="false"
      :group="`creature-list`"
      ghost-class="ghost"
      draggable=".creature"
      handle=".handle"
      :animation="200"
      @change="change"
    >
      <creature-list-tile
        v-for="creature in dataCreatures"
        :key="creature._id"
        class="creature"
        :to="creature.url"
        :model="creature"
      />
    </draggable>
  </v-list>
</template>

<script lang="js">
  import CreatureListTile from '/imports/ui/creature/creatureList/CreatureListTile.vue';
  import draggable from 'vuedraggable';
  import moveCreatureToFolder from '/imports/api/creature/creatureFolders/methods.js/moveCreatureToFolder.js';
  import {snackbar} from '/imports/ui/components/snackbars/SnackbarQueue.js';

  export default {
    components: {
      CreatureListTile,
      draggable,
    },
    props: {
      creatures: {
        type: Array,
        required: true,
      },
      folderId: {
        type: String,
        default: null,
      },
    },
    data(){return {
      dataCreatures: [],
    }},
    watch:{
      creatures(newValue){
        this.dataCreatures = newValue;
      },
    },
    mounted(){
      this.dataCreatures = this.creatures;
    },
    methods: {
      change({added, moved}){
        let event = added || moved;
        if (event){
          // If this item is now adjacent to another, set the order accordingly
          let order;
          let before = this.dataCreatures[event.newIndex - 1];
          let after = this.dataCreatures[event.newIndex + 1];
          if (before && before._id){
            order = before.order + 0.5;
          } else if (after && after._id) {
            order = after.order - 0.5;
          } else {
            order = -0.5;
          }
          let doc = event.element;
          console.log({doc, order, newIndex: event.newIndex, before, after});
          moveCreatureToFolder.call({
            creatureId: doc._id,
            folderId: this.folderId
          }, error => {
            if (!error) return;
            console.error(error);
            snackbar({
              text: error.reason,
            });
          });
        }
      },
    }
  }
</script>

<style lang="css" scoped>
</style>
