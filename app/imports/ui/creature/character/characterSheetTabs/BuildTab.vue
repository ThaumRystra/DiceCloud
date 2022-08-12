<template lang="html">
  <v-container fluid>
    <v-row dense>
      <v-col cols="12">
        <character-errors
          class="mt-4"
          :creature-id="creatureId"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <slot-cards-to-fill :creature-id="creatureId" />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
        cols="12"
        md="8"
        lg="6"
      >
        <v-card class="pb-4">
          <v-card-title>Slots</v-card-title>
          <build-tree-node-list
            :children="slotBuildTree"
            class="mx-2"
            @selected="_id => propertyClicked({_id, prefix: 'build-tree-node-'})"
          />
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="4"
        lg="6"
      >
        <v-card class="class-details mb-2">
          <v-card-title
            v-if="variables.level"
            class="text-h6"
          >
            Level {{ variables.level.value }}
          </v-card-title>
          <v-list two-line>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title
                  v-if="
                    variables.milestoneLevels &&
                      variables.milestoneLevels.value
                  "
                >
                  {{ variables.milestoneLevels.value }} Milestone levels
                </v-list-item-title>
                <v-list-item-title
                  v-if="
                    !(variables.milestoneLevels &&
                      variables.milestoneLevels.value) ||
                      (variables.xp &&
                        variables.xp.value)
                  "
                >
                  {{
                    variables.xp &&
                      variables.xp.value ||
                      0
                  }} XP
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  icon
                  data-id="experience-info-button"
                  @click="showExperienceList"
                >
                  <v-icon>mdi-information-outline</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn
                  icon
                  data-id="experience-add-button"
                  @click="addExperience"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              v-for="cls in classes"
              :key="cls._id"
              :data-id="`class-${cls._id}`"
              v-on="cls.type === 'class' ? {click: () => propertyClicked({_id: cls._id, prefix: 'class-'})} : {}"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ cls.name }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-avatar>
                {{ cls.level }}
              </v-list-item-avatar>
              <v-list-item-action v-if="cls.type === 'class'">
                <v-btn
                  outlined
                  color="accent"
                  data-id="level-up-btn"
                  :disabled="cls.slotCondition && cls.slotCondition.hasOwnProperty('value') && !cls.slotCondition.value"
                  @click.stop="levelUpDialog(cls._id)"
                >
                  <v-icon left>
                    mdi-plus
                  </v-icon>
                  <template v-if="cls.missingLevels && cls.missingLevels.length">
                    Get Missing Levels 
                  </template>
                  <template v-else>
                    Level Up
                  </template> 
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import BuildTreeNodeList from '/imports/ui/creature/buildTree/BuildTreeNodeList.vue';
import SlotCardsToFill from '/imports/ui/creature/slots/SlotCardsToFill.vue';
import CreatureVariables from '../../../../api/creature/creatures/CreatureVariables';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode.js';
import CharacterErrors from '/imports/ui/creature/character/errors/CharacterErrors.vue';

function traverse(tree, callback, parents = []){
  tree.forEach(node => {
    callback(node, parents);
    traverse(node.children, callback, [...parents, node]);
  });
}

export default {
  components: {
    CharacterErrors,
    BuildTreeNodeList,
    SlotCardsToFill,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  computed: {
    highestLevels(){
      let highestLevels = {};
      let highestLevelsList = [];
      this.classLevels.forEach(classLevel => {
        let name = classLevel.variableName;
        if (
          !highestLevels[name] ||
          highestLevels[name].level < classLevel.level
        ){
          highestLevels[name] = classLevel;
        }
      });
      for (let name in highestLevels){
        highestLevelsList.push(highestLevels[name]);
      }
      highestLevelsList.sort((a, b) => a.level - b.level);
      return highestLevelsList;
    },
    classes() {
      return [
        ...this.highestLevels,
        ...this.classProperties
      ].sort((a, b) => a.order - b.order);
    }
  },
  meteor: {
    creature(){
      return Creatures.findOne(this.creatureId);
    },
    variables() {
      return CreatureVariables.findOne({ _creatureId: this.creatureId }) || {};
    },
    classProperties(){
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'class',
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {order: 1}
      }).fetch();
    },
    classLevels() {
      const classVariableNames = this.classProperties.map(c => c.variableName)
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'classLevel',
        variableName: {$nin: classVariableNames},
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {order: 1}
      });
    },
    slotBuildTree(){
      const slots = CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'propertySlot',
        $or: [
          {'slotCondition.value': {$nin: [false, 0, '']}},
          {'slotCondition.value': {$exists: false}},
          {'slotCondition': {$exists: false}},
        ],
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {order: 1}
      });
      const slotIds = slots.map(s => s._id);
      const slotChildren = CreatureProperties.find({
        'parent.id': {$in: slotIds},
        removed: {$ne: true},
      }, {
        sort: { order: 1 },
      });
      const tree = nodeArrayToTree([
        ...slots.fetch(),
        ...slotChildren.fetch()
      ]);
      traverse(tree, (child, parents) => {
        const model = child.node;
        const isSlotWithSpace = model.type === 'propertySlot' &&
          model.spaceLeft > 0 || 
          !model.quantityExpected ||
          model.quantityExpected.value === 0;
        if(isSlotWithSpace) {
          model._canFill = true;
          parents.forEach(node => {
            if (node.node.type === 'propertySlot'){
              node.node._descendantCanFill = true;
            }
          });
        }
      });
      return tree;
    },
  },
  methods: {
    propertyClicked({_id, prefix}){
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${prefix}${_id}`,
        data: {_id},
      });
    },
    addExperience(){
      this.$store.commit('pushDialogStack', {
        component: 'experience-insert-dialog',
        elementId: 'experience-add-button',
        data: {
          creatureIds: [this.creatureId],
          startAsMilestone: this.variables.milestoneLevels &&
            !!this.variables.milestoneLevels.value,
        },
      });
    },
    showExperienceList(){
      this.$store.commit('pushDialogStack', {
        component: 'experience-list-dialog',
        elementId: 'experience-info-button',
        data: {
          creatureId: this.creatureId,
          startAsMilestone: this.variables.milestoneLevels &&
            !!this.variables.milestoneLevels.value,
        },
      });
    },
    showSlotDialog(){
      this.$store.commit('pushDialogStack', {
        component: 'slot-details-dialog',
        elementId: 'slot-card',
        data: {
          creatureId: this.creatureId,
        },
      });
    },
    levelUpDialog(classId){
      this.$store.commit('pushDialogStack', {
        component: 'level-up-dialog',
        elementId: 'level-up-btn',
        data: {
          creatureId: this.creatureId,
          classId,
        },
        callback(nodeIds){
          if (!nodeIds || !nodeIds.length) return;
          let newPropertyId = insertPropertyFromLibraryNode.call({
            nodeIds,
            parentRef: {
              'id': classId,
              'collection': 'creatureProperties',
            },
          });
          return `tree-node-${newPropertyId}`;
        }
      });
    },
  },
};
</script>

<style lang="css" scoped>
</style>
