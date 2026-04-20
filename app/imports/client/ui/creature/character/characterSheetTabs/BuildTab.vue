<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureProperties, { type CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import { docsToForest, getFilter } from '/imports/api/parenting/parentingFunctions';
import BuildTreeNodeList from '/imports/client/ui/creature/buildTree/BuildTreeNodeList.vue';
import SlotCardsToFill from '/imports/client/ui/creature/slots/SlotCardsToFill.vue';
import FolderGroupCard from '/imports/client/ui/properties/components/folders/FolderGroupCard.vue';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import CharacterErrors from '/imports/client/ui/creature/character/errors/CharacterErrors.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty';
import { key } from '/imports/client/ui/vuexStore';
import { CreatureVariables } from '/imports/client/localCollections/CreatureVariables';

function traverse(tree: any[], callback: (node: any, parents: any[]) => void, parents: any[] = []) {
  tree.forEach(node => {
    callback(node, parents);
    traverse(node.children, callback, [...parents, node]);
  });
}

const props = defineProps<{ creatureId: string }>();
const store = useStore(key);
const tabName = 'build';
const cols = { cols: '12', md: '6', xl: '4' };

const { result: startFolders } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    groupStats: true,
    inactive: { $ne: true },
    removed: { $ne: true },
    tab: tabName,
    location: 'start',
  }, { sort: { left: 1 } }).fetch()
);

const { result: endFolders } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    groupStats: true,
    inactive: { $ne: true },
    removed: { $ne: true },
    tab: tabName,
    location: 'end',
  }, { sort: { left: 1 } }).fetch()
);

const { result: creature } = autorun(() =>
  Creatures.findOne(props.creatureId)
);

const { result: variables } = autorun(() =>
  (CreatureVariables.findOne({ _creatureId: props.creatureId }) || {}) as Record<string, any>
);

const { result: hiddenPointBuys } = autorun(() =>
  CreatureProperties.find({
    type: 'pointBuy',
    ...getFilter.descendantsOfRoot(props.creatureId),
    ignored: true,
    pointsLeft: { $ne: 0 },
    removed: { $ne: true },
    inactive: { $ne: true },
  }).fetch()
);

const { result: hiddenSlots } = autorun(() =>
  CreatureProperties.find({
    type: 'propertySlot',
    ...getFilter.descendantsOfRoot(props.creatureId),
    ignored: true,
    $and: [
      {
        $or: [
          { 'slotCondition.value': { $nin: [false, 0, ''] } },
          { 'slotCondition.value': { $exists: false } },
        ],
      }, {
        $or: [
          { 'quantityExpected.value': { $in: [false, 0, '', undefined] } },
          { 'quantityExpected.value': { exists: false } },
          { spaceLeft: { $gt: 0 } },
        ],
      },
    ],
    removed: { $ne: true },
    inactive: { $ne: true },
  }).fetch()
);

const { result: classProperties } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    type: 'class',
    removed: { $ne: true },
    inactive: { $ne: true },
  }, {
    sort: { left: 1 },
  }).fetch()
);

const { result: classLevels } = autorun(() => {
  const classVariableNames = (classProperties.value || []).map((c: any) => c.variableName);
  return CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    type: 'classLevel',
    variableName: { $nin: classVariableNames },
    removed: { $ne: true },
    inactive: { $ne: true },
  }, {
    sort: { left: 1 },
  }).fetch();
});

const { result: slotBuildTree } = autorun(() => {
  const slots = CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    type: { $in: ['propertySlot', 'pointBuy'] },
    $or: [
      { 'slotCondition.value': { $nin: [false, 0, ''] } },
      { 'slotCondition.value': { $exists: false } },
      { 'slotCondition': { $exists: false } },
    ],
    removed: { $ne: true },
    inactive: { $ne: true },
  } as Mongo.Selector<CreatureProperty>);
  const slotIds = slots.map((s: any) => s._id);
  const slotChildren = CreatureProperties.find({
    'parentId': { $in: slotIds },
    removed: { $ne: true },
  });
  const tree = docsToForest([
    ...slots.fetch(),
    ...slotChildren.fetch(),
  ].sort((a: any, b: any) => a.left - b.left));
  traverse(tree, (child, parents) => {
    const model = child.doc;
    const isSlotWithSpace = model.type === 'propertySlot' && (
      model.spaceLeft > 0 ||
      !model.quantityExpected ||
      model.quantityExpected.value === 0
    );
    if (isSlotWithSpace) {
      model._canFill = true;
      parents.forEach((node: any) => {
        node.doc._descendantCanFill = true;
      });
    }
  });
  return tree;
});

const highestLevels = computed(() => {
  const highestLevelsMap: Record<string, any> = {};
  (classLevels.value || []).forEach((classLevel: any) => {
    const name = classLevel.variableName;
    if (!highestLevelsMap[name] || highestLevelsMap[name].level < classLevel.level) {
      highestLevelsMap[name] = classLevel;
    }
  });
  return Object.values(highestLevelsMap).sort((a, b) => a.level - b.level);
});

const classes = computed(() =>
  [...highestLevels.value, ...(classProperties.value || [])].sort((a: any, b: any) => a.order - b.order)
);

const hiddenCount = computed(() =>
  (hiddenSlots.value?.length || 0) + (hiddenPointBuys.value?.length || 0)
);

function clickProperty({ _id }: { _id: string }) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `${_id}`,
    data: { _id },
  });
}

function clickTreeProperty({ _id }: { _id: string }) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `tree-node-${_id}`,
    data: { _id },
  });
}

function softRemove(_id: string) {
  softRemoveProperty.call({ _id }, (error: any) => {
    if (error) {
      snackbar({ text: error.reason || error.message || error.toString() });
      console.error(error);
    }
  });
}

function propertyClicked({ _id, prefix }: { _id: string; prefix?: string }) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `${prefix || ''}${_id}`,
    data: { _id },
  });
}

function addExperience() {
  store.commit('pushDialogStack', {
    component: 'experience-insert-dialog',
    elementId: 'experience-add-button',
    data: {
      creatureIds: [props.creatureId],
      startAsMilestone: (variables.value as any)?.milestoneLevels?.value,
    },
  });
}

function showExperienceList() {
  store.commit('pushDialogStack', {
    component: 'experience-list-dialog',
    elementId: 'experience-info-button',
    data: {
      creatureId: props.creatureId,
      startAsMilestone: (variables.value as any)?.milestoneLevels?.value,
    },
  });
}

function showSlotDialog() {
  store.commit('pushDialogStack', {
    component: 'slot-details-dialog',
    elementId: 'slot-card',
    data: { creatureId: props.creatureId },
  });
}

function levelUpDialog(classId: string) {
  store.commit('pushDialogStack', {
    component: 'level-up-dialog',
    elementId: 'level-up-btn',
    data: {
      creatureId: props.creatureId,
      classId,
    },
    async callback(nodeIds: string[]) {
      if (!nodeIds || !nodeIds.length) return;
      const newPropertyId = await insertPropertyFromLibraryNode.callAsync({
        nodeIds,
        parentRef: {
          id: classId,
          collection: 'creatureProperties',
        },
      });
      return `tree-node-${newPropertyId}`;
    },
  });
}

async function unhideProp(_id: string) {
  try {
    await updateCreatureProperty.callAsync({
      _id,
      path: ['ignored'],
      value: false,
    });
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.reason || error.message || error.toString() });
  }
}
</script>

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
          @sub-click="_id => clickTreeProperty({ _id })"
          @remove="softRemove"
        />
      </v-col>
      <v-col v-bind="cols">
        <v-card class="pb-4">
          <v-card-title style="height: 68px;">
            Slots
            <v-spacer />
            <v-scale-transition>
              <v-menu
                location="bottom left"
                
                transition="slide-y-transition"
              >
                <template #activator="{ props }">
                  <v-badge
                    v-show="hiddenCount"
                    color="primary"
                    overlap
                    :model-value="hiddenCount"
                    :content="hiddenCount"
                  >
                    <v-btn
                      icon
                      v-bind="props"
                    >
                      <v-icon>mdi-file-hidden</v-icon>
                    </v-btn>
                  </v-badge>
                </template>
                <v-list>
                  <v-list-subheader>
                    <v-icon class="mr-2">
                      mdi-file-hidden
                    </v-icon>
                    {{ hiddenCount }} hidden {{ hiddenCount > 1 ? 'properties' : 'property' }}
                  </v-list-subheader>
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
            @selected="_id => propertyClicked({ _id, prefix: 'tree-node-' })"
          />
        </v-card>
      </v-col>
      <v-col v-bind="cols">
        <v-card class="class-details mb-2">
          <v-card-title
            v-if="variables.level"
            class="text-h6"
          >
            Level {{ variables.level.value }}
          </v-card-title>
          <v-list lines="two">
            <v-list-item>
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
              <template #append>
                <v-btn
                  icon
                  data-id="experience-info-button"
                  @click="showExperienceList"
                >
                  <v-icon>mdi-information-outline</v-icon>
                </v-btn>
                <v-btn
                  icon
                  data-id="experience-add-button"
                  @click="addExperience"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
            </v-list-item>
            <v-list-item
              v-for="cls in classes"
              :key="cls._id"
              :data-id="`class-${cls._id}`"
              v-on="cls.type === 'class' ? { click: () => propertyClicked({ _id: cls._id, prefix: 'class-' }) } : {}"
            >
              <v-list-item-title>
                {{ cls.name }}
              </v-list-item-title>
              <template #prepend>
                {{ cls.level }}
              </template>
              <template #append>
                <v-btn
                  v-if="cls.type === 'class'"
                  variant="outlined"
                  color="accent"
                  data-id="level-up-btn"
                  :disabled="cls.slotCondition && cls.slotCondition.hasOwnProperty('value') && !cls.slotCondition.value"
                  prepend-icon="mdi-plus"
                  @click.stop="levelUpDialog(cls._id)"
                >
                  <template v-if="cls.missingLevels && cls.missingLevels.length">
                    Get Missing Levels
                  </template>
                  <template v-else>
                    Level Up
                  </template>
                </v-btn>
              </template>
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
          @sub-click="_id => clickTreeProperty({ _id })"
          @remove="softRemove"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="css" scoped></style>
