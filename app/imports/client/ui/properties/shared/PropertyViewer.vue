<template lang="html">
  <div
    v-if="model && $options.components[model.type]"
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
          class="text--disabled"
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
      :is="model.type"
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
              small
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
            small
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

<script lang="js">
import propertyViewerIndex from '/imports/client/ui/properties/viewers/shared/propertyViewerIndex';
import CreaturePropertiesTree from '/imports/client/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import PropertyField from '/imports/client/ui/properties/viewers/shared/PropertyField.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import DescendantPropertiesTree from '/imports/client/ui/creature/creatureProperties/DescendantPropertiesTree.vue';

export default {
  components: {
    ...propertyViewerIndex,
    CreaturePropertiesTree,
    PropertyField,
    DescendantPropertiesTree,
  },
  props: {
    model: {
      type: Object,
      default: undefined
    },
    collection: {
      type: String,
      default: 'creatureProperties'
    },
  },
  data() {
    return {
      childrenLength: 0,
    }
  },
  meteor: {
    deactivatingToggle() {
      if (!this.model.deactivatingToggleId) return;
      return CreatureProperties.findOne(this.model.deactivatingToggleId);
    }
  },
  computed: {
    slotFillTypeName() {
      return getPropertyName(this.model.slotFillerType);      
    },
  },
  methods: {
    selectSubProperty(_id) {
      this.$emit('select-sub-property', _id);
    },
  },
}
</script>

<style lang="css">
.property-viewer ol, .property-viewer ul {
  padding-left: 36px;
}
</style>
