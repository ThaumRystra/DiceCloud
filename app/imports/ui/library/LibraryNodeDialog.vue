<template lang="html">
  <dialog-base>
    <template #replace-toolbar="{flat}">
      <property-toolbar
        :model="model"
        :editing="editing"
        :flat="flat"
        @duplicate="duplicate"
        @move="move"
        @remove="remove"
        @toggle-editing="editing = !editing"
        @color-changed="value => change({path: ['color'], value})"
      />
    </template>
    <template v-if="model">
      <v-fade-transition
        mode="out-in"
      >
        <component
          :is="model.type + 'Form'"
          v-if="editing"
          :key="_id"
          class="library-node-form"
          :model="model"
          @change="change"
          @push="push"
          @pull="pull"
        />
        <component
          :is="model.type + 'Viewer'"
          v-else-if="!editing && $options.components[model.type + 'Viewer']"
          :key="_id"
          class="creature-property-viewer"
          :model="model"
        />
        <p v-else>
          This property can't be viewed yet.
        </p>
      </v-fade-transition>
    </template>
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
  } from '/imports/api/library/LibraryNodes.js';
  import duplicateLibraryNode from '/imports/api/library/methods/duplicateLibraryNode.js';
  import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
  import PropertyToolbar from '/imports/ui/components/propertyToolbar.vue';
  import { getPropertyName } from '/imports/constants/PROPERTIES.js';
  import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
  import propertyFormIndex from '/imports/ui/properties/forms/shared/propertyFormIndex.js';
  import propertyViewerIndex from '/imports/ui/properties/viewers/shared/propertyViewerIndex.js';
  import { get } from 'lodash';
  import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions.js';
  import { organizeDoc } from '/imports/api/parenting/organizeMethods.js';
  import { snackbar } from '/imports/ui/components/snackbars/SnackbarQueue.js';
  import getPropertyTitle from '/imports/ui/properties/shared/getPropertyTitle.js';

  let formIndex = {};
  for (let key in propertyFormIndex){
    formIndex[key + 'Form'] = propertyFormIndex[key];
  }

  let viewerIndex = {};
  for (let key in propertyViewerIndex){
    formIndex[key + 'Viewer'] = propertyViewerIndex[key];
  }

  export default {
    components: {
      PropertyToolbar,
      PropertyIcon,
      DialogBase,
      ...formIndex,
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
      include: ['editPermission', 'isLibraryForm'],
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
