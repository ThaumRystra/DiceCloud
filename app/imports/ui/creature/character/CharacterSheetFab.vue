<template lang="html">
  <v-speed-dial
    v-if="speedDials"
    v-model="fab"
    direction="bottom"
  >
    <template #activator>
      <v-btn
        v-model="fab"
        color="primary"
        fab
        data-id="insert-creature-property-fab"
        class="insert-creature-property-fab"
        small
      >
        <transition
          name="fab-rotate"
        >
          <v-icon
            style="transition: transform 0.2s ease-in-out"
            :style="fab && 'transform: rotate(45deg)'"
          >
            add
          </v-icon>
        </transition>
      </v-btn>
    </template>

    <labeled-fab
      v-for="type in speedDials"
      :key="type"
      color="primary"
      :data-id="`insert-creature-property-type-${type}`"
      :label="'New ' + properties[type].name"
      :icon="properties[type].icon"
      :disabled="!editPermission"
      @click="insertPropertyOfType(type)"
    />
    <template v-if="tabNumber === 5">
      <labeled-fab
        key="property"
        color="primary"
        data-id="insert-creature-property-btn"
        label="New Property"
        icon="create"
        :disabled="!editPermission"
        @click="insertTreeProperty"
      />
      <labeled-fab
        key="property"
        color="primary"
        data-id="insert-creature-property-from-library-btn"
        label="Property From Library"
        icon="book"
        :disabled="!editPermission"
        @click="propertyFromLibrary"
      />
    </template>
  </v-speed-dial>
</template>

<script lang="js">
  import LabeledFab from '/imports/ui/components/LabeledFab.vue';
  import { getHighestOrder } from '/imports/api/parenting/order.js';
  import insertProperty from '/imports/api/creature/creatureProperties/methods/insertProperty.js';
  import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
  import PROPERTIES from '/imports/constants/PROPERTIES.js';
  import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode.js';

  function getParentAndOrderFromSelectedTreeNode(creatureId){
    // find the parent based on the currently selected property
    let el = document.querySelector('.tree-tab .tree-node-title.primary--text');
    let selectedComponent = el && el.parentElement.__vue__.$parent;
    let parentRef, order;
    if (selectedComponent){
      if (selectedComponent.showExpanded){
        parentRef = {
          id: selectedComponent.node._id,
          collection: 'creatureProperties',
        };
        order = getHighestOrder({
          collection: CreatureProperties,
          ancestorId: parentRef.id,
        }) + 0.5;
      } else {
        parentRef = selectedComponent.node.parent;
        order = selectedComponent.node.order + 0.5;
      }
    } else {
      parentRef = {collection: 'creatures', id: creatureId};
      order = getHighestOrder({
        collection: CreatureProperties,
        ancestorId: parentRef.id,
      }) + 0.5;
    }
    return {parentRef, order}
  }

  function hideFab(){
    let fab = document.querySelector('.insert-creature-property-fab');
    if (fab) fab.style.opacity = '0';
    return fab;
  }

  function revealFab(fab){
    if (!fab) return;
    // Bring back the fab with scale up animation
    fab.style.transition = 'none';
    fab.style.opacity = '';
    fab.style.transform = 'scale(0)';
    setTimeout(()=> {
      fab.style.transform = '';
      fab.style.transition = '';
    }, 400);
  }

  const tabs = [
    'stats',
    'features',
    'inventory',
    'spells',
    'character',
    'tree',
  ];

  export default {
    components: {
      LabeledFab,
    },
    props: {
      editPermission: Boolean,
    },
    data(){return {
      fab: false,
    };},
    computed: {
      creatureId(){
        return this.$route.params.id;
      },
      tabNumber(){
        return this.$store.getters.tabById(this.creatureId);
      },
      speedDials(){
        return this.speedDialsByTab[tabs[this.tabNumber]];
      },
      speedDialsByTab() { return {
        'stats': ['attribute', 'skill', 'action', 'attack'],
        'features': ['feature'],
        'inventory': ['item', 'container'],
        'spells': ['spellList', 'spell'],
        'character': ['note'],
        'tree': [],
      };},
      properties(){
        return PROPERTIES;
      },
    },
    methods: {
      insertPropertyOfType(type){
        let creatureId = this.creatureId;
        let fab = hideFab();

        // Open the dialog to insert the property
        this.$store.commit('pushDialogStack', {
          component: 'creature-property-creation-dialog',
          elementId: 'insert-creature-property-type-' + type,
          data: {
            forcedType: type,
          },
          callback(creatureProperty){
            if (!creatureProperty) return 'insert-creature-property-fab';
            revealFab(fab);

            // Insert the property
            creatureProperty.order = getHighestOrder({
              collection: CreatureProperties,
              ancestorId: creatureId
            }) + 1;
            let id = insertProperty.call({
              creatureProperty,
              parentRef: {collection: 'creatures', id: creatureId},
            });
            return id;
          }
        });
      },
      insertTreeProperty(){
        let creatureId = this.creatureId;
        let fab = hideFab();
        // Open the dialog to insert the property
        this.$store.commit('pushDialogStack', {
          component: 'creature-property-creation-dialog',
          elementId: 'insert-creature-property-btn',
          callback(creatureProperty){
            if (!creatureProperty) return 'insert-creature-property-fab';
            revealFab(fab);

            // Get order and parent
            let {parentRef, order } = getParentAndOrderFromSelectedTreeNode(creatureId);
            creatureProperty.order = order;

            // Insert the property
            let id = insertProperty.call({creatureProperty, parentRef});
            return `tree-node-${id}`;
          }
        });
      },
      propertyFromLibrary(){
        let creatureId = this.creatureId;
        let fab = hideFab();

        this.$store.commit('pushDialogStack', {
          component: 'creature-property-from-library-dialog',
          elementId: 'insert-creature-property-from-library-btn',
          callback(libraryNode){
            if (!libraryNode) return 'insert-creature-property-fab';
            revealFab(fab);

            let nodeId = libraryNode._id;
            let {parentRef, order } = getParentAndOrderFromSelectedTreeNode(creatureId);

            let id = insertPropertyFromLibraryNode.call({nodeId, parentRef, order});
            return `tree-node-${id}`;
          }
        });
      },
    }
  }
</script>

<style lang="css" scoped>
  .insert-creature-property-fab {
    transition: transform 0.07s cubic-bezier(0.5, 0.2, 0.8, 0.4) 0s;
  }
</style>
