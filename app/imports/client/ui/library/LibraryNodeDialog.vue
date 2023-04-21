<template lang="html">
  <dialog-base>
    <template #replace-toolbar="{flat}">
      <property-toolbar
        :model="model"
        :editing="editing"
        :flat="flat"
        :embedded="embedded"
        @duplicate="duplicate"
        @move="move"
        @copy="copy"
        @remove="remove"
        @toggle-editing="editing = !editing"
        @color-changed="value => change({path: ['color'], value})"
      />
    </template>
    <v-fade-transition
      mode="out-in"
    >
      <div v-if="!_id" />
      <div
        v-else-if="!$subReady.libraryNode"
        class="fill-height layout justify-center align-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
      </div>
      <property-form
        v-else-if="model && editing"
        :key="_id"
        class="library-node-form"
        collection="libraryNodes"
        :model="model"
        :embedded="embedded"
        @change="change"
        @push="push"
        @pull="pull"
        @add-child="addLibraryNode"
        @select-sub-property="selectSubProperty"
      />
      <component
        :is="model.type + 'Viewer'"
        v-else-if="model && !editing && $options.components[model.type + 'Viewer']"
        :key="_id"
        class="creature-property-viewer"
        :model="model"
      />
      <p v-else>
        This property can't be viewed yet.
      </p>
    </v-fade-transition>
    <div
      v-if="!embedded"
      slot="actions"
      class="layout justify-end"
    >
      <template v-if="selection">
        <v-btn
          text
          @click="$store.dispatch('popDialogStack', false)"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          text
          @click="$store.dispatch('popDialogStack', true)"
        >
          Select
        </v-btn>
      </template>
      <v-btn
        v-else
        text
        @click="$store.dispatch('popDialogStack')"
      >
        Done
      </v-btn>
    </div>
  </dialog-base>
</template>

<script lang="js">
import LibraryNodes, {
  updateLibraryNode,
  pushToLibraryNode,
  pullFromLibraryNode,
  softRemoveLibraryNode,
  restoreLibraryNode,
  insertNode,
} from '/imports/api/library/LibraryNodes.js';
import duplicateLibraryNode from '/imports/api/library/methods/duplicateLibraryNode.js';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import PropertyToolbar from '/imports/client/ui/components/propertyToolbar.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import propertyFormIndex from '/imports/client/ui/properties/forms/shared/propertyFormIndex.js';
import propertyViewerIndex from '/imports/client/ui/properties/viewers/shared/propertyViewerIndex.js';
import { get } from 'lodash';
import {
  assertDocEditPermission, assertDocCopyPermission
} from '/imports/api/sharing/sharingPermissions.js';
import { organizeDoc } from '/imports/api/parenting/organizeMethods.js';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle.js';
import copyLibraryNodeTo from '/imports/api/library/methods/copyLibraryNodeTo.js';
import { getHighestOrder } from '/imports/api/parenting/order.js';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';
import PropertyForm from '/imports/client/ui/properties/PropertyForm.vue';
let viewerIndex = {};
for (let key in propertyViewerIndex){
  viewerIndex[key + 'Viewer'] = propertyViewerIndex[key];
}

export default {
  components: {
    PropertyToolbar,
    PropertyIcon,
    DialogBase,
    PropertyForm,
    ...viewerIndex,
  },
  props: {
    _id: String,
    startInEditTab: Boolean,
    embedded: Boolean, // This dialog is embedded in a page
    selection: Boolean, // This dialog is being used to select a node
  },
  reactiveProvide: {
    name: 'context',
    include: ['editPermission', 'copyPermission', 'isLibraryForm'],
  },
  data(){return {
    editing: !!this.startInEditTab,
    // CurrentId lags behind Id by one tick so that events fired by destroying
    // forms keyed to the old ID are applied before the new ID overwrites it
    currentId: undefined,
    isLibraryForm: true,
  }},
  watch: {
    _id: {
      immediate: true,
      handler(newId){
        this.$nextTick(() => {
          this.currentId = newId;
        });
      }
    },
  },
  meteor: {
    $subscribe: {
      'libraryNode'(){
        return [this._id];
      }
    },
    model(){
      return LibraryNodes.findOne(this.currentId);
    },
    editPermission(){
      try {
        assertDocEditPermission(this.model, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
    copyPermission(){
      try {
        assertDocCopyPermission(this.model, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  methods: {
    getPropertyName,
    duplicate(){
      duplicateLibraryNode.call({
        _id: this.currentId
      }, (error, duplicateId) => {
        if (error) console.error(error);
        if (this.embedded){
          this.$emit('duplicated', duplicateId);
        } else {
          this.$store.dispatch('popDialogStack');
        }
      });
    },
    selectSubProperty(_id) {
      if (this.embedded) {
        this.$emit('select-sub-property', _id);
        return;
      }
      this.$store.commit('pushDialogStack', {
        component: 'library-node-dialog',
        elementId: `tree-node-${_id}`,
        data: {
          _id,
          startInEditTab: this.editing,
        },
      });
    },
    move(){
      let that = this;
      this.$store.commit('pushDialogStack', {
        component: 'move-library-node-dialog',
        elementId: 'property-toolbar-menu-button',
        callback(parentId){
          if (!parentId) return;
          organizeDoc.call({
            docRef: {
              collection: 'libraryNodes',
              id: that._id,
            },
            parentRef: {
              collection: 'libraryNodes',
              id: parentId
            },
            order: -0.5
          }, (error) => {
            if (error) console.error(error);
          });
        }
      });
    },
    copy(){
      const thisId = this._id;
      this.$store.commit('pushDialogStack', {
        component: 'move-library-node-dialog',
        elementId: 'property-toolbar-menu-button',
        data: {
          action: 'Copy',
        },
        callback(parentId){
          if (!parentId) return;
          copyLibraryNodeTo.call({
            _id: thisId,
            parent: {
              collection: 'libraryNodes',
              id: parentId
            },
          }, (error) => {
            if (error) {
              console.error(error);
              snackbar({
                text: error.reason || error.message || error.toString(),
              });
            } else {
              snackbar({
                text: 'Copied successfully',
              });
            }
          });
        }
      });
    },
    change({path, value, ack}){
      updateLibraryNode.call({_id: this.currentId, path, value}, (error) =>{
        if (ack){
          ack(error && error.reason || error);
        } else if (error){
          console.error(error);
        }
      });
    },
    push({path, value, ack}){
      pushToLibraryNode.call({_id: this.currentId, path, value}, (error) =>{
        if (ack){
          ack(error && error.reason || error);
        } else if (error){
          console.error(error);
        }
      });
    },
    pull({path, ack}){
      let itemId = get(this.model, path)._id;
      path.pop();
      pullFromLibraryNode.call({_id: this.currentId, path, itemId}, (error) =>{
        if (ack){
          ack(error && error.reason || error);
        } else if (error){
          console.error(error);
        }
      });
    },
    addLibraryNode({elementId, suggestedType}) {
      // Check tier has paid benefits
      let tier = getUserTier(Meteor.userId());
      if (!(tier && tier.paidBenefits)){
        this.$store.commit('pushDialogStack', {
          component: 'tier-too-low-dialog',
          elementId,
        });
        return;
      }
      let parentPropertyId = this.model._id;
      this.$store.commit('pushDialogStack', {
        component: 'add-creature-property-dialog',
        elementId,
        data: {
          parentDoc: this.model,
          creatureId: this.creatureId,
          hideLibraryTab: true,
          suggestedType,
          noBackdropClose: true,
        },
        callback(result){
          if (!result) return;
          let parentRef = {
            id: parentPropertyId,
            collection: 'libraryNodes',
          };
          let order = getHighestOrder({
            collection: LibraryNodes,
            ancestorId: parentRef.id,
          }) + 0.5;
          let libraryNode = result;
          // Get order and parent
          libraryNode.order = order;
          // Insert the property
          let id = insertNode.call({libraryNode, parentRef});
          return `tree-node-${id}`;
        }
      });
    },
    remove(){
      let _id = this.currentId;
      softRemoveLibraryNode.call({_id});
      if (this.embedded){
        this.$emit('removed');
      } else {
        this.$store.dispatch('popDialogStack');
      }
      snackbar({
        text: `Deleted ${getPropertyTitle(this.model)}`,
        callbackName: 'undo',
        callback(){
          restoreLibraryNode.call({_id});
        },
      });
    },
  }
};
</script>

<style lang="css" scoped>
</style>
