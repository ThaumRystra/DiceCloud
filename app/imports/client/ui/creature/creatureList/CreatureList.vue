<template lang="html">
  <draggable
    v-model="dataCreatures"
    style="min-height: 24px;"
    :sort="false"
    :group="`creature-list`"
    ghost-class="ghost"
    draggable=".creature"
    handle=".handle"
    :animation="200"
    @change="draggableChange"
  >
    <creature-list-tile
      v-for="creature in dataCreatures"
      :key="creature._id"
      class="creature"
      :model="creature"
      :selection="selection"
      :is-selected="selectedCreature === creature._id"
      v-bind="selection ? {} : {to: creature.url}"
      :dense="dense"
      :data-id="dense ? undefined : creature._id"
      @click="$emit('creature-selected', creature._id)"
    />
  </draggable>
</template>

<script lang="js">
  import CreatureListTile from '/imports/client/ui/creature/creatureList/CreatureListTile.vue';
  import draggable from 'vuedraggable';
  import moveCreatureToFolder from '/imports/api/creature/creatureFolders/methods.js/moveCreatureToFolder.js';
  import {snackbar} from '/imports/client/ui/components/snackbars/SnackbarQueue.js';

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
      selection: Boolean,
      selectedCreature: {
        type: String,
        default: undefined,
      },
      dense: Boolean,
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
      draggableChange({added, moved}){
        let event = added || moved;
        if (event){
          /*
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
          */
          let doc = event.element;
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
      selectionChange(index){
        this.$emit('creatureSelected', this.dataCreatures[index]._id)
      },
    }
  }
</script>

<style lang="css" scoped>
</style>
