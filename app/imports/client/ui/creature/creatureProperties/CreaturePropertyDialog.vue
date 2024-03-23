<template lang="html">
  <dialog-base>
    <template #replace-toolbar="{flat}">
      <property-toolbar
        :model="model"
        :editing="editing"
        :flat="flat"
        :embedded="embedded"
        style="flex-grow: 0;"
        @duplicate="duplicate"
        @remove="remove"
        @copy-to-library="copyToLibrary"
        @toggle-editing="editing = !editing"
      />
    </template>
    <template v-if="model">
      <div
        class="layout mb-4"
      >
        <breadcrumbs
          :model="model"
          :editing="editing"
          :embedded="embedded"
          @select-sub-property="selectSubProperty"
        />
        <v-spacer />
        <v-chip disabled>
          {{ typeName }}
        </v-chip>
      </div>
      <v-fade-transition
        mode="out-in"
      >
        <div v-if="editing">
          <property-form
            :key="_id"
            class="creature-property-form"
            :model="model"
            :embedded="embedded"
            @change="change"
            @push="push"
            @pull="pull"
            @add-child="addProperty"
            @select-sub-property="selectSubProperty"
          />
        </div>
        <property-viewer 
          v-else
          :key="_id"
          :model="model"
          @select-sub-property="selectSubProperty"
        />
      </v-fade-transition>
    </template>
    <template #actions>
      <div
        v-if="!embedded"
        class="layout"
      >
        <v-spacer />
        <v-btn
          text
          color="accent"
          @click="$store.dispatch('popDialogStack')"
        >
          Close
        </v-btn>
      </div>
    </template>
  </dialog-base>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import damageProperty from '/imports/api/creature/creatureProperties/methods/damageProperty';
import pushToProperty from '/imports/api/creature/creatureProperties/methods/pushToProperty';
import pullFromProperty from '/imports/api/creature/creatureProperties/methods/pullFromProperty';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty';
import restoreProperty from '/imports/api/creature/creatureProperties/methods/restoreProperty';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';
import duplicateProperty from '/imports/api/creature/creatureProperties/methods/duplicateProperty';
import Creatures from '/imports/api/creature/creatures/Creatures';
import PropertyToolbar from '/imports/client/ui/components/propertyToolbar.vue';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import PropertyForm from '/imports/client/ui/properties/PropertyForm.vue';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import { get, findLast } from 'lodash';
import equipItem from '/imports/api/creature/creatureProperties/methods/equipItem';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import insertProperty from '/imports/api/creature/creatureProperties/methods/insertProperty';
import Breadcrumbs from '/imports/client/ui/creature/creatureProperties/Breadcrumbs.vue';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import PropertyViewer from '/imports/client/ui/properties/shared/PropertyViewer.vue';
import copyPropertyToLibrary from '/imports/api/creature/creatureProperties/methods/copyPropertyToLibrary';

export default {
  components: {
    PropertyForm,
    DialogBase,
    PropertyToolbar,
    Breadcrumbs,
    PropertyViewer,
  },
  props: {
    _id: String,
    embedded: Boolean, // This dialog is embedded in a page
    startInEditTab: Boolean,
  },
  data(){ return {
    editing: !!this.startInEditTab,
    // CurrentId lags behind Id by one tick so that events fired by destroying
    // forms keyed to the old ID are applied before the new ID overwrites it
    currentId: undefined,
  }},
  meteor: {
    model(){
      return CreatureProperties.findOne(this.currentId);
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
  computed: {
    creature(){
      if (!this.model) return;
      return Creatures.findOne(this.model.root.id);
    },
    creatureId(){
      return this.creature && this.creature._id;
    },
    typeName(){
      if (!this.model) return;
      return getPropertyName(this.model.type)
    }
  },
  watch: {
    _id: {
      immediate: true,
      handler(newId) {
        this.$nextTick(() => {
          this.currentId = newId;
        });
      }
    },
  },
  reactiveProvide: {
    name: 'context',
    include: ['creatureId', 'editPermission'],
  },
  methods: {
    getPropertyName,
    duplicate(){
      duplicateProperty.call({_id: this.currentId}, (error, id) => {
        if (error) {
          console.error(error);
        }
        if (this.embedded){
          this.$emit('duplicated', id);
        } else {
          this.$store.dispatch('popDialogStack');
        }
      });
    },
    change(arg) {
      const { path, value, ack } = arg;
      if (path && path[0] === 'equipped'){
        equipItem.call({_id: this.currentId, equipped: value}, ack);
        return;
      }
      updateCreatureProperty.call({_id: this.currentId, path, value}, ack);
    },
    damage({operation, value, ack}){
      damageProperty.call({_id: this.currentId, operation, value}, ack);
    },
    push({path, value, ack}){
      pushToProperty.call({_id: this.currentId, path, value}, ack);
    },
    pull({path, ack}){
      let itemId = get(this.model, path)._id;
      path.pop();
      pullFromProperty.call({_id: this.currentId, path, itemId}, ack);
    },
    remove(){
      const _id = this.currentId;
      softRemoveProperty.call({_id});
      if (this.embedded){
        this.$emit('removed');
      } else {
        this.$store.dispatch('popDialogStack');
      }
      snackbar({
        text: `Deleted ${getPropertyTitle(this.model)}`,
        callbackName: 'undo',
        callback(){
          restoreProperty.call({_id});
        },
      });
    },
    selectSubProperty(_id) {
      if (this.embedded) {
        this.$emit('select-sub-property', _id);
        return;
      }
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `tree-node-${_id}`,
        data: {
          _id,
          startInEditTab: this.editing,
        },
      });
    },
    copyToLibrary() {
      const thisId = this._id;
      this.$store.commit('pushDialogStack', {
        component: 'move-library-node-dialog',
        elementId: 'property-toolbar-menu-button',
        data: {
          action: 'Copy',
        },
        callback(parentId){
          if (!parentId) return;
          copyPropertyToLibrary.call({
            propId: thisId,
            parentRef: {
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
    addProperty({elementId, suggestedType}){
      let parentPropertyId = this.model._id;
      this.$store.commit('pushDialogStack', {
        component: 'insert-property-dialog',
        elementId,
        data: {
          parentDoc: this.model,
          creatureId: this.creatureId,
          suggestedType,
          noBackdropClose: true,
        },
        callback(result){
          if (!result) return;
          let parentRef = {
            id: parentPropertyId,
            collection: 'creatureProperties',
          };
          if (Array.isArray(result)){
            let nodeIds = result;
            let id = insertPropertyFromLibraryNode.call({ nodeIds, parentRef });
            return `tree-node-${id}`;
          } else {
            let creatureProperty = result;
            // Insert the property
            let id = insertProperty.call({creatureProperty, parentRef});
            return `tree-node-${id}`;
          }
        }
      });
    },
  }
};
</script>

<style lang="css" scoped>
</style>
