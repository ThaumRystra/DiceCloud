<template lang="html">
  <v-container>
    <v-row dense>
      <v-col cols="12" md="8" lg="6" style="height: 100%;">
        <v-card style="height: calc(100vh - 120px); overflow: auto;">
          <v-card-title>Slots</v-card-title>
          <build-tree-node-list :children="slotBuildTree" />
        </v-card>
      </v-col>
      <v-col cols="12" md="4" lg="6">
        <v-card class="class-details mb-2">
          <v-card-title
            v-if="creature.variables.level"
            class="text-h6"
          >
            Level {{ creature.variables.level.value }}
          </v-card-title>
          <v-list two-line>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title
                  v-if="
                    creature.variables.milestoneLevels &&
                      creature.variables.milestoneLevels.value
                  "
                >
                  {{ creature.variables.milestoneLevels.value }} Milestone levels
                </v-list-item-title>
                <v-list-item-title
                  v-if="
                    !(creature.variables.milestoneLevels &&
                      creature.variables.milestoneLevels.value) ||
                      (creature.variables.xp &&
                        creature.variables.xp.value)
                  "
                >
                  {{
                    creature.variables.xp &&
                      creature.variables.xp.value ||
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
              v-for="classLevel in highestClassLevels"
              :key="classLevel._id"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ classLevel.name }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-avatar>
                {{ classLevel.level }}
              </v-list-item-avatar>
            </v-list-item>
          </v-list>
        </v-card>
        <toolbar-card
          data-id="slot-card"
          @toolbarclick="showSlotDialog"
        >
          <template slot="toolbar">
            <v-toolbar-title>
              Build
            </v-toolbar-title>
            <v-spacer />
            <v-toolbar-title>
              <v-icon
                small
                style="width: 16px;"
                class="mr-1"
              >
                mdi-pencil
              </v-icon>
            </v-toolbar-title>
          </template>
          <v-card-text style="background-color: inherit;">
            <slots :creature-id="creatureId" />
          </v-card-text>
        </toolbar-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
import Slots from '/imports/ui/creature/slots/Slots.vue';
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import  { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import BuildTreeNodeList from '/imports/ui/creature/buildTree/BuildTreeNodeList.vue';

function traverse(tree, callback, parents = []){
  tree.forEach(node => {
    callback(node, parents);
    traverse(node.children, callback, [...parents, node]);
  });
}

export default {
  components: {
    ColumnLayout,
    Slots,
    ToolbarCard,
    BuildTreeNodeList,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  computed: {
    highestClassLevels(){
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
  },
  mounted(){
    if (this.$store.state.showDetailsDialog){
      this.$store.commit('setShowDetailsDialog', false);
      this.showCharacterForm();
    }
  },
  meteor: {
    creature(){
      return Creatures.findOne(this.creatureId);
    },
    classLevels(){
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'classLevel',
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
          (model.quantityExpected && model.quantityExpected.value == 0);
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
    addExperience(){
      this.$store.commit('pushDialogStack', {
        component: 'experience-insert-dialog',
        elementId: 'experience-add-button',
        data: {
          creatureIds: [this.creatureId],
          startAsMilestone: this.creature.variables.milestoneLevels &&
            !!this.creature.variables.milestoneLevels.value,
        },
      });
    },
    showExperienceList(){
      this.$store.commit('pushDialogStack', {
        component: 'experience-list-dialog',
        elementId: 'experience-info-button',
        data: {
          creatureId: this.creatureId,
          startAsMilestone: this.creature.variables.milestoneLevels &&
            !!this.creature.variables.milestoneLevels.value,
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
  },
};
</script>

<style lang="css" scoped>
</style>
