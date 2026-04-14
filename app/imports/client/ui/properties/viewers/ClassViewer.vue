<template lang="html">
  <div class="class-viewer">
    <v-row dense>
      <property-field
        name="Variable Name"
        mono
        :value="model.variableName"
      />
      <property-field
        name="Condition"
        :value="model.slotCondition && (model.slotCondition.value || model.slotCondition.calculation)"
      />
      <property-field
        v-if="(model.slotTags && model.slotTags.length) || (model.extraTags && model.extraTags.length)"
        name="Tags Required"
        :cols="{ cols: 12 }"
      >
        <div>
          <property-tags :tags="model.slotTags" />
          <div
            v-for="tags in model.extraTags"
            :key="tags._id"
          >
            <div class="text-caption">
              {{ tags.operation }}
            </div>
            <property-tags :tags="tags.tags" />
          </div>
        </div>
      </property-field>
      <property-field
        name="Missing Levels"
        mono
        :value="model.missingLevels &&
          (model.missingLevels.length || undefined) &&
          model.missingLevels.join(', ')
          "
      />
      <property-field
        v-if="context.creatureId"
        name="Level"
        :value="model.level"
      />
      <property-field
        v-if="context.creatureId"
        name="Level Up"
        :cols="{ cols: 12 }"
      >
        <v-btn
          variant="outlined"
          color="accent"
          data-id="level-up-btn"
          :disabled="model.slotCondition && model.slotCondition.hasOwnProperty('value') && !model.slotCondition.value"
          @click="levelUpDialog"
          prepend-icon="mdi-plus"
        >
          <template v-if="model.missingLevels && model.missingLevels.length">
            Get Missing Levels
          </template>
          <template v-else>
            Level Up
          </template>
        </v-btn>
      </property-field>
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useStore } from 'vuex';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ model: Record<string, any> }>();
const context = inject<any>('context', {});
const store = useStore(key);

function levelUpDialog() {
  const classId = props.model._id;
  store.commit('pushDialogStack', {
    component: 'level-up-dialog',
    elementId: 'level-up-btn',
    data: {
      creatureId: context.creatureId,
      classId: props.model._id,
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
    }
  });
}
</script>

<style lang="css" scoped></style>
