<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import { Session } from 'meteor/session';
import Docs, { organizeDoc } from '/imports/api/docs/Docs';
import { docsToForest } from '/imports/api/parenting/parentingFunctions';
import { useRouter } from 'vue-router';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);
const router = useRouter();
const refreshTree = ref(0);

const drawer = computed({
  get() {
    return store.state.rightDrawer;
  },
  set(value) {
    store.commit('setRightDrawer', value);
  },
});

const { result: editing } = autorun(() => Session.get('editingDocs'));
const { result: docs } = autorun(() => {
  const docs = Docs.find({ removed: { $ne: true } }, { sort: { left: 1 } }).fetch();
  return docsToForest(docs);
});

function selected(docId: string) {
  const doc = Docs.findOne(docId);
  if (!doc) return;
  router.push(doc.href);
}

function moveWithinRoot({ doc, newPosition }: { doc: any; newPosition: number }) {
  organizeDoc.callAsync({
    docId: doc._id,
    newPosition,
  });
}
</script>

<template lang="html">
  <v-navigation-drawer
    v-if="editing"
    v-model="drawer"
    location="right"
  >
    <tree-node-list
      :key="refreshTree"
      :children="docs"
      :organize="true"
      :selected-node="undefined"
      :root="{ collection: 'docs', id: 'DDDDDDDDDDDDDDDDD' }"
      group="docs"
      @move-within-root="moveWithinRoot"
      @selected="selected"
    />
  </v-navigation-drawer>
</template>

<style lang="css" scoped></style>
