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
        @make-reference="makeReference"
        @toggle-editing="editing = !editing"
        @color-changed="value => change({path: ['color'], value})"
      />
    </template>
    <v-fade-transition>
      <div
        v-if="model"
        class="layout mb-4"
      >
        <breadcrumbs
          :model="model"
          :editing="editing"
          :embedded="embedded"
          collection="libraryNodes"
          @select-sub-property="selectSubProperty"
        />
        <v-spacer />
        <v-chip disabled>
          {{ typeName }}
        </v-chip>
      </div>
    </v-fade-transition>
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
      <property-viewer 
        v-else-if="model"
        :key="_id"
        :model="model"
        collection="libraryNodes"
        @select-sub-property="selectSubProperty"
      />
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
} from '/imports/api/library/LibraryNodes';
import duplicateLibraryNode from '/imports/api/library/methods/duplicateLibraryNode';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import PropertyToolbar from '/imports/client/ui/components/propertyToolbar.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import { get } from 'lodash';
import {
  assertDocEditPermission, assertDocCopyPermission
} from '/imports/api/sharing/sharingPermissions';
import { organizeDoc } from '/imports/api/parenting/organizeMethods';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';
import copyLibraryNodeTo from '/imports/api/library/methods/copyLibraryNodeTo';
import { getUserTier } from '/imports/api/users/patreon/tiers';
import PropertyForm from '/imports/client/ui/properties/PropertyForm.vue';
import PropertyViewer from '/imports/client/ui/properties/shared/PropertyViewer.vue';
import Breadcrumbs from '/imports/client/ui/creature/creatureProperties/Breadcrumbs.vue';

export default {
  components: {
    PropertyToolbar,
    Breadcrumbs,
    DialogBase,
    PropertyForm,
    PropertyViewer,
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
  computed: {
    typeName(){
      if (!this.model) return;
      return getPropertyName(this.model.type)
    },
  },
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
    makeReference() {
      insertNode.call({
        libraryNode: {
          type: 'reference',
          ref: {
            collection: 'libraryNodes',
            id: this.model._id,
          },
        },
        parentRef: this.model.parent,
      }, (error, docId) => {
        if (error) console.error(error);
        if (this.embedded){
          this.$emit('duplicated', docId);
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
      const id = this._id;
      this.$store.commit('pushDialogStack', {
        component: 'move-library-node-dialog',
        elementId: 'property-toolbar-menu-button',
        callback(parentId){
          if (!parentId) return;
          organizeDoc.callAsync({
            docRef: {
              collection: 'libraryNodes',
              id,
            },
            parentRef: {
              collection: 'libraryNodes',
              id: parentId
            },
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
        component: 'insert-property-dialog',
        elementId,
        data: {
          parentDoc: this.model,
          creatureId: this.creatureId,
          hideLibraryTab: true,
          suggestedType,
          noBackdropClose: true,
          showLibraryOnlyProps: true,
          collection: 'libraryNodes',
        },
        callback(result){
          if (!result) return;
          let parentRef = {
            id: parentPropertyId,
            collection: 'libraryNodes',
          };
          let libraryNode = result;
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
