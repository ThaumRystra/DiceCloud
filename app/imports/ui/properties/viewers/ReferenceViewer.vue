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
        name="Linked Property"
      >
        <div style="overflow: hidden;">
          <tree-node-view :model="model.cache.node" />
        </div>
      </property-field>
      <property-field
        v-if="model.cache.library && model.cache.library.name"
        name="Library"
        :value="model.cache.library.name"
      />
    </v-row>
  </div>
</template>

<script lang="js">
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
  import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';

	export default {
    components: {
      TreeNodeView,
    },
		mixins: [propertyViewerMixin],
	}
</script>

<style lang="css" scoped>
</style>
