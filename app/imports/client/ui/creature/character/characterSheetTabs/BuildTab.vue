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
      <slot-cards-to-fill :creature-id="creatureId" />
    </v-row>
    <v-row dense>
      <v-col
        v-for="folder in startFolders"
        :key="folder._id"
        v-bind="cols"
      >
        <folder-group-card
          :model="folder"
          @click-property="clickProperty"
          @sub-click="_id => clickTreeProperty({_id})"
          @remove="softRemove"
        />
      </v-col>
      <v-col
        v-bind="cols"
      >
        <v-card class="pb-4">
          <v-card-title style="height: 68px;">
            Slots
            <v-spacer />
            <v-scale-transition>
              <v-menu
                bottom
                left
                transition="slide-y-transition"
              >
                <template #activator="{ on }">
                  <v-badge
                    v-show="hiddenCount"
                    slot="activator"
                    color="primary"
                    overlap
                    :value="hiddenCount"
                    :content="hiddenCount"
                  >
                    <v-btn
                      icon
                      v-on="on"
                    >
                      <v-icon>mdi-file-hidden</v-icon>
                    </v-btn>
                  </v-badge>
                </template>
                <v-list>
                  <v-subheader>
                    <v-icon class="mr-2">
                      mdi-file-hidden
                    </v-icon>
                    {{ hiddenCount }} hidden {{ hiddenCount > 1 ? 'properties' : 'property' }}
                  </v-subheader>
                  <v-list-item
                    v-for="pointBuy in hiddenPointBuys"
                    :key="pointBuy._id"
                    @click="unhideProp(pointBuy._id)"
                  >
                    <v-list-item-title>
                      {{ getPropertyTitle(pointBuy) }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-for="slot in hiddenSlots"
                    :key="slot._id"
                    @click="unhideProp(slot._id)"
                  >
                    <v-list-item-title>
                      {{ getPropertyTitle(slot) }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-scale-transition>
          </v-card-title>
          <build-tree-node-list
            :children="slotBuildTree"
            class="mx-2"
            @selected="_id => propertyClicked({_id, prefix: 'tree-node-'})"
          />
        </v-card>
      </v-col>
      <v-col
        v-bind="cols"
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
      <v-col
        v-for="folder in endFolders"
        :key="folder._id"
        v-bind="cols"
      >
        <folder-group-card
          :model="folder"
          @click-property="clickProperty"
          @sub-click="_id => clickTreeProperty({_id})"
          @remove="softRemove"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { docsToForest } from '/imports/api/parenting/parentingFunctions';
import BuildTreeNodeList from '/imports/client/ui/creature/buildTree/BuildTreeNodeList.vue';
import SlotCardsToFill from '/imports/client/ui/creature/slots/SlotCardsToFill.vue';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import CharacterErrors from '/imports/client/ui/creature/character/errors/CharacterErrors.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';
import tabFoldersMixin from '/imports/client/ui/properties/components/folders/tabFoldersMixin';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

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
  mixins: [tabFoldersMixin],
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      tabName: 'build',
      cols: {
        cols: '12',
        md: '6',
        xl: '4',
      }
    };
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
    },
    hiddenCount() {
      return this.hiddenSlots.length + this.hiddenPointBuys.length;
    },
  },
  meteor: {
    creature(){
      return Creatures.findOne(this.creatureId);
    },
    variables() {
      return CreatureVariables.findOne({ _creatureId: this.creatureId }) || {};
    },
    hiddenPointBuys() {
      return CreatureProperties.find({
        type: 'pointBuy',
        ...getFilter.descendantsOfRoot(this.creatureId),
        ignored: true,
        pointsLeft: {$ne: 0},
        removed: {$ne: true},
        inactive: {$ne: true},
      }).fetch();
    },
    hiddenSlots(){
      return CreatureProperties.find({
        type: 'propertySlot',
        ...getFilter.descendantsOfRoot(this.creatureId),
        ignored: true,
        $and: [
          { 
            $or: [
              {'slotCondition.value': {$nin: [false, 0, '']}},
              {'slotCondition.value': {$exists: false}},
            ]
          },{
            $or: [
              { 'quantityExpected.value': {$in: [false, 0, '', undefined]} },
              { 'quantityExpected.value': {exists: false} },
              {spaceLeft: {$gt: 0}},
            ]
          },
        ],        
        removed: {$ne: true},
        inactive: {$ne: true},
      }).fetch();
    },
    classProperties(){
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        type: 'class',
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {left: 1}
      }).fetch();
    },
    classLevels() {
      const classVariableNames = this.classProperties.map(c => c.variableName)
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        type: 'classLevel',
        variableName: {$nin: classVariableNames},
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {left: 1}
      });
    },
    slotBuildTree(){
      const slots = CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        type: {$in: ['propertySlot', 'pointBuy']},
        $or: [
          {'slotCondition.value': {$nin: [false, 0, '']}},
          {'slotCondition.value': {$exists: false}},
          {'slotCondition': {$exists: false}},
        ],
        removed: {$ne: true},
        inactive: {$ne: true},
      });
      const slotIds = slots.map(s => s._id);
      const slotChildren = CreatureProperties.find({
        'parentId': {$in: slotIds},
        removed: {$ne: true},
      });
      const tree = docsToForest([
        ...slots.fetch(),
        ...slotChildren.fetch()
      ].sort((a, b) => a.left - b.left));
      traverse(tree, (child, parents) => {
        const model = child.doc;
        const isSlotWithSpace = model.type === 'propertySlot' && (
          model.spaceLeft > 0 || 
          !model.quantityExpected ||
          model.quantityExpected.value === 0
        );
        if(isSlotWithSpace) {
          model._canFill = true;
          parents.forEach(node => {
            node.doc._descendantCanFill = true;
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
    getPropertyTitle,
    unhideProp(_id) {
      updateCreatureProperty.call({
        _id,
        path: ['ignored'],
        value: false,
      }, error => {
        if (error){
          console.error(error);
          snackbar({text: error.reason || error.message || error.toString()});
        }
      });
    },
  },
};
</script>

<style lang="css" scoped>
</style>
