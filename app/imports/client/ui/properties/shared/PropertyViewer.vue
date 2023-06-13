<template lang="html">
  <div
    v-if="model && $options.components[model.type]"
    class="property-viewer"
  >
    <component
      :is="model.type"
      :key="model._id"
      class="property-viewer"
      :model="model"
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
        <creature-properties-tree
          style="width: 100%;"
          :root="{collection, id: model._id}"
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
import propertyViewerIndex from '/imports/client/ui/properties/viewers/shared/propertyViewerIndex.js';
import CreaturePropertiesTree from '/imports/client/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import PropertyField from '/imports/client/ui/properties/viewers/shared/PropertyField.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';

export default {
  components: {
    ...propertyViewerIndex,
    CreaturePropertiesTree,
    PropertyField,
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

</style>
