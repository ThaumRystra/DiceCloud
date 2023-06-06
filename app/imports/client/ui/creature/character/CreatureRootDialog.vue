<template lang="html">
  <dialog-base>
    <template #replace-toolbar="{flat}">
      <property-toolbar
        :model="creature"
        :editing="editing"
        :flat="flat"
        :embedded="embedded"
        style="flex-grow: 0;"
        @toggle-editing="editing = !editing"
      />
    </template>
    <template v-if="_id">
      <v-fade-transition
        mode="out-in"
      >
        <div v-if="editing">
          <creature-properties-tree
            style="width: 100%;"
            class="mb-2"
            organize
            :root="{collection: 'creatures', id: _id}"
            @length="childrenLength = $event"
            @selected="selectSubProperty"
          />
          <v-btn
            icon
            outlined
            color="accent"
            data-id="insert-creature-property-btn"
            @click="addProperty"
          >
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
        </div>
        <div v-else>
          <creature-properties-tree
            style="width: 100%;"
            :root="{collection: 'creatures', id: _id}"
            @length="childrenLength = $event"
            @selected="selectSubProperty"
          />
        </div>
      </v-fade-transition>
    </template>
    <div
      v-if="!embedded"
      slot="actions"
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
  </dialog-base>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import PropertyToolbar from '/imports/client/ui/components/propertyToolbar.vue';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import propertyFormIndex from '/imports/client/ui/properties/forms/shared/propertyFormIndex.js';
import propertyViewerIndex from '/imports/client/ui/properties/viewers/shared/propertyViewerIndex.js';
import CreaturePropertiesTree from '/imports/client/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import { getHighestOrder } from '/imports/api/parenting/order.js';
import insertProperty from '/imports/api/creature/creatureProperties/methods/insertProperty.js';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode.js';

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
    // CurrentId lags behind Id by one tick so that events fired by destroying
    // forms keyed to the old ID are applied before the new ID overwrites it
    currentId: undefined,
    childrenLength: 0,
  }},
  meteor: {
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
      return Creatures.findOne(this._id);
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
  reactiveProvide: {
    name: 'context',
    include: ['creatureId', 'editPermission'],
  },
  methods: {
    getPropertyName,
    selectSubProperty(_id){
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `tree-node-${_id}`,
        data: {
          _id,
          startInEditTab: this.editing,
        },
      });
    },
    addProperty(){
      let parentPropertyId = this._id;
      this.$store.commit('pushDialogStack', {
        component: 'insert-property-dialog',
        elementId: 'insert-creature-property-btn',
        data: {
          parentDoc: this.creature,
          creatureId: this._id,
          noBackdropClose: true,
        },
        callback(result){
          if (!result) return;
          let parentRef = {
            id: parentPropertyId,
            collection: 'creatures',
          };
          let order = getHighestOrder({
            collection: CreatureProperties,
            ancestorId: parentRef.id,
          }) + 0.5;
          if (Array.isArray(result)){
            let nodeIds = result;
            let id = insertPropertyFromLibraryNode.call({nodeIds, parentRef, order});
            return `tree-node-${id}`;
          } else {
            let creatureProperty = result;
            // Get order and parent
            creatureProperty.order = order;
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
