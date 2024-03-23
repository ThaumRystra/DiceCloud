<template lang="html">
  <v-speed-dial
    v-model="fab"
    v-bind="$attrs"
    :style="!speedDials ? 'visibility: hidden;' : ''"
  >
    <template #activator>
      <v-btn
        v-model="fab"
        color="primary"
        fab
        small
        data-id="insert-creature-property-fab"
        class="insert-creature-property-fab"
      >
        <transition
          name="fab-rotate"
        >
          <v-icon
            style="transition: transform 0.2s ease-in-out"
            :style="fab && 'transform: rotate(45deg)'"
          >
            mdi-plus
          </v-icon>
        </transition>
      </v-btn>
    </template>
    <labeled-fab
      v-for="type in speedDials"
      :key="type"
      color="primary"
      :data-id="`insert-creature-property-type-${type}`"
      :label="getPropertyLabel(type)"
      :icon="type ? properties[type].icon : 'mdi-plus'"
      :disabled="!editPermission"
      @click="addProperty(type)"
    />
  </v-speed-dial>
</template>

<script lang="js">
  import LabeledFab from '/imports/client/ui/components/LabeledFab.vue';
  import insertProperty from '/imports/api/creature/creatureProperties/methods/insertProperty';
  import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
  import Creatures from '/imports/api/creature/creatures/Creatures';
  import PROPERTIES from '/imports/constants/PROPERTIES';
  import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
  import { fetchDocByRef } from '/imports/api/parenting/parentingFunctions';

  function getParentFromSelectedTreeNode(creatureId, $store){
    // find the parent based on the currently selected property
    let el = document.querySelector('.tree-tab .tree-node-title.primary--text');
    let selectedComponent = el && el.parentElement.__vue__.$parent;
    let parentRef;
    const onTreeTab = $store.getters.tabNameById(creatureId) === 'tree';
    if (onTreeTab && selectedComponent){
      if (selectedComponent.showExpanded){
        parentRef = {
          id: selectedComponent.node._id,
          collection: 'creatureProperties',
        };
      } else {
        parentRef = selectedComponent.node.parent;
      }
    } else {
      parentRef = {collection: 'creatures', id: creatureId};
    }
    return parentRef;
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
      tabName(){
        return this.$store.getters.tabNameById(this.creatureId);
      },
      speedDials(){
        return this.speedDialsByTab[this.tabName];
      },
      speedDialsByTab() { return {
        'stats': ['attribute', 'skill', 'buff'],
        'features': ['feature'],
        'spells': ['spellList', 'spell'],
        'actions': ['action'],
        'inventory': ['item', 'container'],
        'journal': ['note'],
        'tree': [null],
      };},
      properties(){
        return PROPERTIES;
      },
    },
    meteor: {
      hideSpellsTab(){
        let creature = Creatures.findOne(this.creatureId);
        return creature?.settings?.hideSpellsTab;
      },
    },
    methods: {
      getPropertyLabel(type){
        if (type === 'buff') return 'Buff or Condition';
        return type ? PROPERTIES[type].name : 'Property'
      },
      addProperty(forcedType){
        let creatureId = this.creatureId;
        let fab = hideFab();

        let parentRef  = getParentFromSelectedTreeNode(creatureId, this.$store);
        let parent;
        try {
          parent = fetchDocByRef(parentRef);
        } catch (e) {
          console.warn(e);
        }

        this.$store.commit('pushDialogStack', {
          component: 'insert-property-dialog',
          elementId: 'insert-creature-property-type-' + forcedType,
          data: {
            parentDoc: forcedType ? undefined : parent,
            forcedType,
            creatureId: this.creatureId,
            noBackdropClose: true,
          },
          async callback(result){
            if (!result){
              return 'insert-creature-property-fab';
            }
            if (Array.isArray(result)){
              revealFab(fab);
              let nodeIds = result;
              let id = insertPropertyFromLibraryNode.call({nodeIds, parentRef});
              return forcedType ? id : `tree-node-${id}`;
            } else {
              revealFab(fab);
              let creatureProperty = result;
              // Insert the property
              let id = await insertProperty.callAsync({creatureProperty, parentRef});
              return forcedType ? id : `tree-node-${id}`;
            }
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
