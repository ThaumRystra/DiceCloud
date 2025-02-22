<template lang="html">
  <div
    v-if="model && $options.components[model.type]"
    class="property-viewer"
  >
    <v-row dense>
      <property-field
        v-if="model.inactive"
        :name="$t('PropertyViewer.EhamBkUEXXiR61RswQ_LF')"
        :cols="{cols: 12}"
      >
        <div
          style="width: 100%"
          class="text--disabled"
        >
          <div>
            {{ $t('PropertyViewer.ayyUiD347dMgQAbxzCUHn') }}
          </div>
          <div
            v-if="model.deactivatedByToggle && deactivatingToggle"
            class="pt-2"
          >
            <div>{{ $t('PropertyViewer.A2-Kaprp4titpzjHtBl0m') }}</div>
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
            {{ $t('PropertyViewer.ffr0YqqdylRGtGQSlp-eW') }}
          </div>
          <div
            v-if="model.deactivatedBySelf"
            class="pt-2"
          >
            {{ $t('PropertyViewer.Sk44T3yriJNHryB4ttpXi') }}
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
          :name="$t('PropertyViewer.R2y59Jx1lSCn_iVM3UiTM')"
        >
          <ul>
            <li
              v-if="model.fillSlots"
            >
              {{ $t('PropertyForm.XXwZiSyy3PLlHms5-hiEq') }}
            </li>
            <li v-if="model.searchable">
              {{ $t('PropertyForm.MZRFbTU4dQcWdpVlXv9ah') }}
            </li>
          </ul>
        </property-field>
        <property-field 
          :name="$t('PropertyForm.nN8qiVQXkc18VOhirptoM')"
          :value="slotFillTypeName"
        />
        <property-field 
          :name="$t('PropertyForm.rOdph7uHJPkuF3rKxLiUA')"
          :value="model.slotQuantityFilled"
        />
        <property-field 
          :name="$t('PropertyForm.reKPKGEnAfdHpBLoywE1w')"
          mono
          :value="model.slotFillerCondition"
        />
        <property-field 
          :name="$t('PropertyForm.pfX-T7sDiiLNLZ4XYxmZe')"
          :value="model.slotFillerConditionNote"
        />
        <property-field 
          :name="$t('PropertyForm.hRA5h3_UC9k3Zk3iFywu8')"
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
        :name="$t('PropertyForm.vAMpUe37OijnEHSpa_exs')"
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
        :name="$t('PropertyViewer.sIjkFiqjLqnIGsWsdWtDC')"
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
    {{ $t('PropertyViewer.hCNvG0nKgX-D86BdSbmsv') }}
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
