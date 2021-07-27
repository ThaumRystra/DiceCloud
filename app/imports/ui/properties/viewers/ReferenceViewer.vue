<template lang="html">
  <div class="reference-viewer">
    <property-field
      v-if="model.cache.error"
      name="Error"
      :value="model.cache.error"
    />
    <template v-else-if="model.ref && model.ref.id">
      <div class="text-caption">
        Linked Property
      </div>
      <tree-node-view :model="model.cache.node" />
    </template>
    <property-field
      v-if="model.cache.library && model.cache.library.name"
      name="Library"
      :value="model.cache.library.name"
    />
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
