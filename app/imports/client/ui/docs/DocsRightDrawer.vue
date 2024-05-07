<template lang="html">
  <v-navigation-drawer
    v-if="editing"
    v-model="drawer"
    app
    right
  >
    <tree-node-list
      :key="refreshTree"
      :children="docs"
      :organize="true"
      :selected-node="undefined"
      group="docs"
      @selected="selected"
      @reordered="reordered"
      @reorganized="reorganized"
    />
  </v-navigation-drawer>
</template>

<script lang="js">
import { docsToForest } from '/imports/api/parenting/parentingFunctions';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { organizeDoc, reorderDoc } from '/imports/api/docs/Docs.js';
import Docs from '/imports/api/docs/Docs.js';

export default {
  components: {
    TreeNodeList,
  },
  data() {
    return {
    refreshTree: 0,
  }},
  computed: {
    drawer: {
      get () {
        return this.$store.state.rightDrawer;
      },
      set (value) {
        this.$store.commit('setRightDrawer', value);
      },
    },
  },
  meteor: {
    editing() {
      return Session.get('editingDocs');
    },
    docs() {
      const docs = Docs.find({ removed: {$ne: true} }, { sort: {left: 1} }).fetch();
      return docsToForest(docs);
    },
  },
  methods: {
    selected(docId) {
      const doc = Docs.findOne(docId);
      if (!doc) return;
      console.log(doc.href);
      this.$router.push(doc.href);
    },
    reordered({ doc, newIndex }) {
      reorderDoc.callAsync({
        docId: doc._id,
        order: newIndex,
      });
    },
    reorganized({ doc, parent, newIndex }) {
      if (!parent) {
        this.refreshTree += 1;
        console.error('Moving docs to root level isn\'t implemented');
        return;
      }
      organizeDoc.callAsync({
        docId: doc._id,
        parentId: parent?._id,
        order: newIndex,
      });
    },
  }
}
</script>

<style lang="css" scoped>
</style>
