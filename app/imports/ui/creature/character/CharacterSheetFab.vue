<template lang="html">
  <v-speed-dial
    v-if="speedDials && speedDials.length"
    v-model="fab"
    direction="bottom"
  >
    <template #activator>
      <v-btn
        v-model="fab"
        color="primary"
        fab
        data-id="insert-creature-property-fab"
        small
      >
        <v-icon>add</v-icon>
        <v-icon>close</v-icon>
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
  </v-speed-dial>
</template>

<script>
  import LabeledFab from '/imports/ui/components/LabeledFab.vue';
  import { setDocToLastOrder } from '/imports/api/parenting/order.js';
  import insertProperty from '/imports/api/creature/creatureProperties/methods/insertProperty.js';
  import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
  import PROPERTIES from '/imports/constants/PROPERTIES.js';

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
      };},
      properties(){
        return PROPERTIES;
      },
    },
    methods: {
      insertPropertyOfType(type){
        let that = this;
        this.$store.commit('pushDialogStack', {
          component: 'creature-property-creation-dialog',
          elementId: 'insert-creature-property-type-' + type,
          data: {
            forcedType: type,
          },
          callback(creatureProperty){
            if (!creatureProperty) return;
            creatureProperty.parent = {collection: 'creatures', id: that.creatureId};
            creatureProperty.ancestors = [ {collection: 'creatures', id: that.creatureId}];
            setDocToLastOrder({collection: CreatureProperties, doc: creatureProperty});
            let id = insertProperty.call({creatureProperty});
            return id;
          }
        });
      }
    }
  }
</script>

<style lang="css" scoped>
</style>
