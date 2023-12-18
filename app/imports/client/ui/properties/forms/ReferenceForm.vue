<template lang="html">
  <div class="reference-form">
    <v-row dense>
      <v-col cols="12">
        <outlined-input
          v-ripple
          name="Linked Property"
          class="pa-4 mb-6"
          data-id="change-ref"
          style="cursor: pointer;"
          @click="changeReference"
        > 
          <v-progress-circular
            v-if="linkLoading"
            indeterminate
          />
          <div
            v-else
            class="d-flex align-center"
          >
            <v-icon class="mr-4">
              mdi-vector-link
            </v-icon>
            <div class="flex-grow-1">
              <tree-node-view
                v-if="model && model.cache && model.cache.node"
                :model="model.cache.node"
              />
              <div v-else>
                {{ model.cache.node && model.cache.node.name || model.ref && model.ref.id }}
              </div>
              <div
                v-if="model.cache.library && model.cache.library.name"
                class="text-caption"
              >
                {{ model.cache.library && model.cache.library.name }}
              </div>
              <div
                v-if="model.cache.error || errors.ref"
                class="error--text"
              >
                {{ model.cache.error || errors.ref }}
              </div>
            </div>
            <v-btn
              class="ml-4"
              icon
              @click.stop="updateReferenceNode"
            >
              <v-icon>
                mdi-refresh
              </v-icon>
            </v-btn>
          </div>
        </outlined-input>
      </v-col>
    </v-row>
    <form-sections
      v-if="$slots.default"
      type="reference"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
  import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
  import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
  import updateReferenceNode from '/imports/api/library/methods/updateReferenceNode';
  import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';

  export default {
    components: {
      TreeNodeView,
      OutlinedInput,
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
