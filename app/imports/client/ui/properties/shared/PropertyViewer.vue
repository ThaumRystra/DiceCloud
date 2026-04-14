<script setup lang="ts">
import { ref, computed } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import propertyViewerIndex from '/imports/client/ui/properties/viewers/shared/propertyViewerIndex';
import CreaturePropertiesTree from '/imports/client/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import DescendantPropertiesTree from '/imports/client/ui/creature/creatureProperties/DescendantPropertiesTree.vue';

const props = withDefaults(defineProps<{
  model?: Record<string, any>;
  collection?: string;
}>(), {
  model: undefined,
  collection: 'creatureProperties',
});

const emit = defineEmits(['change', 'remove', 'select-sub-property']);

const childrenLength = ref(0);

const viewerComponent = computed(() =>
  props.model ? (propertyViewerIndex as any)[props.model.type] : undefined
);

const { result: deactivatingToggle } = autorun(() => {
  if (!props.model?.deactivatingToggleId) return undefined;
  return CreatureProperties.findOne(props.model.deactivatingToggleId);
});

const slotFillTypeName = computed(() =>
  getPropertyName(props.model?.slotFillerType)
);

function selectSubProperty(_id: string) {
  emit('select-sub-property', _id);
}
</script>

<template lang="html">
  <div
    v-if="model && viewerComponent"
    class="property-viewer"
  >
    <v-row dense>
      <property-field
        v-if="model.inactive"
        name="Status"
        :cols="{cols: 12}"
      >
        <div
          style="width: 100%"
          class="text-disabled"
        >
          <div>
            Inactive
          </div>
          <div
            v-if="model.deactivatedByToggle && deactivatingToggle"
            class="pt-2"
          >
            <div>Deactivated by:</div>
            <v-btn
              block
              :data-id="`tree-node-${model.deactivatingToggleId}`"
              style="text-transform: initial;"
              @click="selectSubProperty(model.deactivatingToggleId)"
            >
              <tree-node-view
                :model="deactivatingToggle"
              />
            </v-btn>
          </div>
          <div
            v-if="model.deactivatedByAncestor"
            class="pt-2"
          >
            Deactivated by ancestor
          </div>
          <div
            v-if="model.deactivatedBySelf"
            class="pt-2"
          >
            Deactivated by own settings
          </div>
        </div>
      </property-field>
    </v-row>
    <component
      :is="viewerComponent"
      :key="model._id"
      class="property-viewer"
      :model="model"
      @select-sub-property="id => selectSubProperty(id)"
      @change="e => $emit('change', e)"
      @remove="$emit('remove')"
    />
    <v-row dense>
      <template
        v-if="collection == 'libraryNodes'"
      >
        <property-field
          v-if="model.fillSlots || model.searchable"
          name="Library Behavior"
        >
          <ul>
            <li
              v-if="model.fillSlots"
            >
              Can fill slots
            </li>
            <li v-if="model.searchable">
              Searchable from character sheet
            </li>
          </ul>
        </property-field>
        <property-field 
          name="Slot fill type"
          :value="slotFillTypeName"
        />
        <property-field 
          name="Slot quantity filled"
          :value="model.slotQuantityFilled"
        />
        <property-field 
          name="Condition"
          mono
          :value="model.slotFillerCondition"
        />
        <property-field 
          name="Condition Error Text"
          :value="model.slotFillerConditionNote"
        />
        <property-field 
          name="Library Tags"
          :cols="{cols: 12}"
        >
          <div
            v-if="model.libraryTags && model.libraryTags.length"
            class="py-2"
          >
            <v-chip
              v-for="(tag, index) in model.libraryTags"
              :key="tag + index"
              class="mr-1"
              size="small"
              disabled
            >
              {{ tag }}
            </v-chip>
          </div>
        </property-field>
      </template>
      <property-field 
        name="Tags"
        :cols="{cols: 12}"
      >
        <div
          v-if="model.tags && model.tags.length"
          class="py-1"
        >
          <v-chip
            v-for="(tag, index) in model.tags"
            :key="tag + index"
            class="mr-1"
            disabled
            size="small"
          >
            {{ tag }}
          </v-chip>
        </div>
      </property-field>
      <property-field
        v-show="childrenLength"
        name="Child properties"
        :cols="{cols: 12}"
      >
        <descendant-properties-tree
          style="width: 100%;"
          :model="model"
          :collection="collection"
          @length="childrenLength = $event"
          @selected="selectSubProperty"
        />
      </property-field>
    </v-row>
  </div>
  <div v-else-if="model">
    This property can't be viewed yet.
  </div>
</template>

<style lang="css">
.property-viewer ol, .property-viewer ul {
  padding-left: 36px;
}
</style>
