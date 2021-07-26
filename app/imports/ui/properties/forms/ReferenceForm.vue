<template lang="html">
  <div class="folder-form layout justify-start wrap">
    <v-text-field
      label="Linked Property"
      style="flex-basis: 300px;"
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
      prepend-inner-icon="mdi-vector-link"
      append-icon="mdi-refresh"
      data-id="change-ref"
      @click="changeReference"
      @click:prepend-inner="changeReference"
      @click:append="updateReferenceNode"
    />
  </div>
</template>

<script lang="js">
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import updateReferenceNode from '/imports/api/library/methods/updateReferenceNode.js';

  export default {
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
