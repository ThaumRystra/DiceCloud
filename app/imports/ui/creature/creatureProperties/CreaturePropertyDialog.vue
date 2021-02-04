<template lang="html">
  <dialog-base>
    <template #replace-toolbar="{flat}">
      <property-toolbar
        :model="model"
        :editing="editing"
        :flat="flat"
        @duplicate="duplicate"
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
          class="creature-property-form"
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
      </v-fade-transition>
      <template v-if="!editing && !embedded">
        <v-divider class="my-2" />
        <creature-properties-tree
          v-if="!editing"
          :root="{collection: 'creatureProperties', id: model._id}"
          @selected="selectSubProperty"
        />
      </template>
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
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import damageProperty from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import pushToProperty from '/imports/api/creature/creatureProperties/methods/pushToProperty.js';
import pullFromProperty from '/imports/api/creature/creatureProperties/methods/pullFromProperty.js';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty.js';
import restoreProperty from '/imports/api/creature/creatureProperties/methods/restoreProperty.js';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty.js';
import duplicateProperty from '/imports/api/creature/creatureProperties/methods/duplicateProperty.js';
import Creatures from '/imports/api/creature/Creatures.js';
import PropertyToolbar from '/imports/ui/components/propertyToolbar.vue';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
import propertyFormIndex from '/imports/ui/properties/forms/shared/propertyFormIndex.js';
import propertyViewerIndex from '/imports/ui/properties/viewers/shared/propertyViewerIndex.js';
import CreaturePropertiesTree from '/imports/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import getPropertyTitle from '/imports/ui/properties/shared/getPropertyTitle.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { get, findLast } from 'lodash';
import equipItem from '/imports/api/creature/creatureProperties/methods/equipItem.js';

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
    ...formIndex,
    ...viewerIndex,
    PropertyIcon,
    DialogBase,
    PropertyToolbar,
    CreaturePropertiesTree,
  },
  props: {
    _id: String,
    embedded: Boolean, // This dialog is embedded in a page
    startInEditTab: Boolean,
  },
  data(){ return {
    editing: !!this.startInEditTab,
  }},
  meteor: {
    model(){
      return CreatureProperties.findOne(this._id);
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
      let nearestCreatureAncestor = findLast(
        this.model.ancestors,
        ref => ref.collection === 'creatures'
      );
      if (!nearestCreatureAncestor) return;
      return Creatures.findOne(nearestCreatureAncestor.id);
    }
  },
  reactiveProvide: {
    name: 'context',
    include: ['creature', 'editPermission'],
  },
  methods: {
    getPropertyName,
    duplicate(){
      duplicateProperty.call({_id: this._id}, (error) => {
        if (error) {
          console.error(error);
        }
        if (this.embedded){
          this.$emit('duplicated');
        } else {
          this.$store.dispatch('popDialogStack');
        }
      });
    },
    change({path, value, ack}){
      if (path && path[0] === 'equipped'){
        equipItem.call({_id: this._id, equipped: value}, (error) =>{
          if (error) console.warn(error);
          ack && ack(error && error.reason || error);
        });
        return;
      }
      updateCreatureProperty.call({_id: this._id, path, value}, (error) =>{
        if (error) console.warn(error);
        ack && ack(error && error.reason || error);
      });
    },
    damage({operation, value, ack}){
      damageProperty.call({_id: this._id, operation, value}, (error) =>{
        if (error) console.warn(error);
        ack && ack(error && error.reason || error);
      });
    },
    push({path, value, ack}){
      pushToProperty.call({_id: this._id, path, value}, (error) =>{
        if (error) console.warn(error);
        ack && ack(error && error.reason || error);
      });
    },
    pull({path, ack}){
      let itemId = get(this.model, path)._id;
      path.pop();
      pullFromProperty.call({_id: this._id, path, itemId}, (error) =>{
        if (error) console.warn(error);
        ack && ack(error && error.reason || error);
      });
    },
    remove(){
      const _id = this._id;
      softRemoveProperty.call({_id});
      if (this.embedded){
        this.$emit('removed');
      } else {
        this.$store.dispatch('popDialogStack');
      }
      this.$store.dispatch('snackbar', {
        text: `Deleted ${getPropertyTitle(this.model)}`,
        callbackName: 'undo',
        callback(){
          restoreProperty.call({_id});
        },
      });
    },
    selectSubProperty(_id){
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `tree-node-${_id}`,
        data: {_id},
      });
    }
  }
};
</script>

<style lang="css" scoped>
</style>
