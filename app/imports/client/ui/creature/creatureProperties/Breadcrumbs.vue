<template lang="html">
  <div
    class="breadcrumbs layout align-center wrap"
    :class="{'no-icons': noIcons}"
  >
    <span
      v-if="noLinks || embedded || collection !== 'creatureProperties'"
    >
      <v-icon v-if="collection === 'creatureProperties'">
        mdi-account
      </v-icon>
      <v-icon v-else-if="collection === 'libraryNodes'">
        mdi-book-open-blank-variant
      </v-icon>
    </span>
    <a
      v-else
      data-id="breadcrumb-root"
      @click="clickRootCreature"
    >
      <v-icon color="accent">
        mdi-account
      </v-icon>
    </a> 
    <template v-for="(prop, index) in props">
      <v-icon
        :key="index"
      >
        mdi-chevron-right
      </v-icon>
      <span
        v-if="noLinks"
        :key="prop._id + '-no-links'"
      >
        <tree-node-view
          :model="prop"
          class="breadcrumb-tree-node-view"
        />
      </span>
      <a
        v-else
        :key="prop._id"
        :data-id="`breadcrumb-${prop._id}`"
        @click="click(prop._id)"
      >
        <tree-node-view
          :model="prop"
          class="breadcrumb-tree-node-view"
        />
      </a>
    </template>
  </div>
</template>

<script lang="js">
import { getFilter } from '/imports/api/parenting/parentingFunctions';
  import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import { Mongo } from 'meteor/mongo';

  export default {
    components: {
      TreeNodeView,
    },
    props: {
      model: {
        type: Object,
        required: true,
      },
      collection: {
        type: String,
        default: 'creatureProperties',
      },
      noLinks: Boolean,
      noIcons: Boolean,
      editing: Boolean,
      embedded: Boolean,
    },
    computed:{
      props() {
        return Mongo.Collection.get(this.collection).find({
          ...getFilter.ancestors(this.model),
          ...this.collection === 'creatureProperties' && { type: { $ne: 'propertySlot' } }
        });
      },
    },
    methods: {
      click(id) {
        if (this.embedded) {
          this.$emit('select-sub-property', id);
          return;
        }
        const store = this.$store;
        // Check if there is a dialog open for this doc already
        let dialogFound;
        let dialogsToPop = 0;
        store.state.dialogStack.dialogs.forEach(dialog => {
          if (dialog.data && dialog.data._id === id){
            dialogFound = true;
            dialogsToPop = 0;
          } else {
            dialogsToPop += 1;
          }
        });
        if (dialogFound){
          // Pop dialogs until we get to it
          store.dispatch('popDialogStacks', dialogsToPop);
        } else {
          const component = this.collection === 'creatureProperties' ? 'creature-property-dialog'
            : this.collection === 'libraryNodes' ? 'library-node-dialog'
            : undefined;
          // Otherwise open it as a new dialog
          store.commit('pushDialogStack', {
            component,
            elementId: `breadcrumb-${id}`,
            data: {
              _id: id,
              startInEditTab: this.editing,
            },
          });
        }
      },
      clickRootCreature() {
        const store = this.$store;
        // Check if there is a dialog open for this doc already
        let dialogFound;
        let dialogsToPop = 0;
        store.state.dialogStack.dialogs.forEach(dialog => {
          if (dialog.component === 'creature-root-dialog'){
            dialogFound = true;
            dialogsToPop = 0;
          } else {
            dialogsToPop += 1;
          }
        });
        if (dialogFound){
          // Pop dialogs until we get to it
          store.dispatch('popDialogStacks', dialogsToPop);
        } else {
          // Otherwise open it as a new dialog
          store.commit('pushDialogStack', {
            component: 'creature-root-dialog',
            elementId: 'breadcrumb-root',
            data: {
              _id: this.model.root.id,
              startInEditTab: this.editing,
            },
          });
        }
      }
    }
  }
</script>

<style lang="css" scoped>
.breadcrumbs {
  margin-bottom: 16px;
  opacity: 0.8;
}
</style>

<style lang="css">
  .no-icons .breadcrumb-tree-node-view .v-icon {
    display: none;
  }
</style>
