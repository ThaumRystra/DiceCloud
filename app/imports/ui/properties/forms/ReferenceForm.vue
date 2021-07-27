<template lang="html">
  <div class="folder-form layout justify-start wrap">
    <div data-id="change-ref">
      <v-input
        :label="model.cache && model.cache.node ? '' : 'Linked Property'"
        style="flex-basis: 300px; cursor: pointer;"
        readonly
        outlined
        persistent-hint
        :loading="linkLoading"
        :value="
          model.cache.node && model.cache.node.name ||
            model.ref && model.ref.id
        "
        :hint="model.cache.library && model.cache.library.name"
        :error-messages="model.cache.error || errors.ref"
        prepend-icon="mdi-vector-link"
        append-icon="mdi-refresh"
        @click="changeReference"
        @click:prepend="changeReference"
        @click:append="updateReferenceNode"
      >
        <tree-node-view
          v-if="model && model.cache && model.cache.node"
          :model="model.cache.node"
        />
      </v-input>
    </div>
  </div>
</template>

<script lang="js">
  import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import updateReferenceNode from '/imports/api/library/methods/updateReferenceNode.js';

  export default {
    components: {
      TreeNodeView,
    },
    mixins: [propertyFormMixin],
    data(){return {
      linkLoading: false,
    }},
    methods: {
      changeReference(){
        let that = this;
        this.$store.commit('pushDialogStack', {
          component: 'select-library-node-dialog',
          elementId: 'change-ref',
          callback(node){
            if (!node) return;
            that.linkLoading = true;
            that.$emit('change', {
              path: ['ref'],
              value: {
                id: node._id,
                collection: 'libraryNodes',
              },
              ack(){
                that.linkLoading = false;
              }
            });
          }
        });
      },
      updateReferenceNode(){
        if (!this.model._id) return;
        this.linkLoading = true;
        updateReferenceNode.call({_id: this.model._id}, () => {
          this.linkLoading = false;
        });
      }
    },
  };
</script>

<style lang="css" scoped>
</style>
