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
      :root="{collection: 'docs', id: 'DDDDDDDDDDDDDDDDD'}"
      group="docs"
      @move-within-root="moveWithinRoot"
      @selected="selected"
    />
  </v-navigation-drawer>
</template>

<script lang="js">
import Docs, { organizeDoc } from '/imports/api/docs/Docs';
import { docsToForest } from '/imports/api/parenting/parentingFunctions';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
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
      const docs = Docs.find({ removed: { $ne: true } }, { sort: { left: 1 } }).fetch();
      return docsToForest(docs);
    },
  },
  methods: {
    selected(docId) {
      const doc = Docs.findOne(docId);
      if (!doc) return;
      this.$router.push(doc.href);
    },
    moveWithinRoot({ doc, newPosition }) {
      organizeDoc.callAsync({
        docId: doc._id,
        newPosition,
      });
    },
  }
}
</script>

<style lang="css" scoped>
</style>
