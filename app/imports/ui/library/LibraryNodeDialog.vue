<template lang="html">
  <dialog-base :key="_id">
    <template #replace-toolbar="{flat}">
      <property-toolbar
        :model="model"
        :editing="editing"
        :flat="flat"
        @remove="remove"
        @toggle-editing="editing = !editing"
        @color-changed="value => change({path: ['color'], value})"
      />
    </template>
    <template v-if="model">
      <component
        :is="model.type + 'Form'"
        v-if="editing"
        class="library-node-form"
        :model="model"
        @change="change"
        @push="push"
        @pull="pull"
      />
      <component
        :is="model.type + 'Viewer'"
        v-else-if="!editing && $options.components[model.type + 'Viewer']"
        class="creature-property-viewer"
        :model="model"
      />
      <p v-else>
        This property can't be viewed yet.
      </p>
    </template>
    <div
      v-if="!embedded"
      slot="actions"
      class="layout row justify-end"
    >
      <v-btn
        flat
        @click="$store.dispatch('popDialogStack')"
      >
        Done
      </v-btn>
    </div>
  </dialog-base>
</template>

<script>
  import LibraryNodes, {
    updateLibraryNode,
    pushToLibraryNode,
    pullFromLibraryNode,
    softRemoveLibraryNode,
  } from '/imports/api/library/LibraryNodes.js';
  import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
  import PropertyToolbar from '/imports/ui/components/propertyToolbar.vue';
  import { getPropertyName } from '/imports/constants/PROPERTIES.js';
  import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
  import propertyFormIndex from '/imports/ui/properties/forms/shared/propertyFormIndex.js';
  import propertyViewerIndex from '/imports/ui/properties/viewers/shared/propertyViewerIndex.js';
  import { get } from 'lodash';
  import { assertDocEditPermission } from '/imports/api/sharing/sharingPermissions.js';

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
      embedded: Boolean, //This dialog is embedded in a page
    },
    reactiveProvide: {
      name: 'context',
      include: ['editPermission'],
    },
    data(){return {
      editing: !!this.startInEditTab,
    }},
    meteor: {
      model(){
        return LibraryNodes.findOne(this._id);
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
      change({path, value, ack}){
        updateLibraryNode.call({_id: this._id, path, value}, (error) =>{
          if (ack){
            ack(error && error.reason || error);
          } else if (error){
            console.error(error);
          }
        });
      },
      push({path, value, ack}){
        pushToLibraryNode.call({_id: this._id, path, value}, (error) =>{
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
        pullFromLibraryNode.call({_id: this._id, path, itemId}, (error) =>{
          if (ack){
            ack(error && error.reason || error);
          } else if (error){
            console.error(error);
          }
        });
      },
      remove(){
        softRemoveLibraryNode.call({_id: this._id});
        if (this.embedded){
          this.$emit('removed');
        } else {
          this.$store.dispatch('popDialogStack');
        }
      },
    }
  };
</script>

<style lang="css" scoped>
</style>
