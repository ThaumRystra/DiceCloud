<template lang="html">
  <div class="reference-viewer">
    <v-row>
      <property-field
        v-if="model.cache.error"
        name="Error"
        :value="model.cache.error"
      />
      <property-field
        v-else-if="model.ref && model.ref.id"
        name="Linked property"
        :cols="{cols: 12, md: 6}"
      >
        <div style="overflow: hidden; min-width: 100%; min-height: 100%;">
          <v-btn
            plain
            class="normal-text"
            style="min-width: 100%; min-height: 100%;"
            :to="(model.cache.library && model.cache.library.id) ? `/library/${model.cache.library.id}` : undefined"
            @click="$emit('select-sub-property', model.ref.id)"
          >
            <div
              class="pa-4"
            >
              <tree-node-view
                :model="model.cache.node"
              />
            </div>
          </v-btn>
        </div>
      </property-field>
      <property-field
        v-if="model.cache.library && model.cache.library.name"
        name="Library"
        :cols="{cols: 12, md: 6}"
      >
        <div style="overflow: hidden; min-width: 100%; min-height: 100%;">
          <v-btn
            plain
            height="56"
            class="normal-text"
            style="min-width: 100%; min-height: 100%;"
            :disabled="!model.cache.library.id"
            :to="`/library/${model.cache.library.id}`"
            @click="$emit('select-sub-property', model.ref.id)"
          >
            {{ model.cache.library.name }}
          </v-btn>
        </div>
      </property-field>
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';

export default {
  components: {
    TreeNodeView,
    OutlinedInput,
  },
  mixins: [propertyViewerMixin],
}
</script>

<style lang="css">
  .reference-viewer .normal-text {
    word-wrap: unset;
    white-space: unset;
    text-transform: unset;
  }
  .reference-viewer .normal-text span {
    max-width: 100%;
  }
</style>
