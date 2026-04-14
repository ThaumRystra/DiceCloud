<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { Session } from 'meteor/session';
import Docs from '/imports/api/docs/Docs';
import DocEditForm from '/imports/client/ui/docs/DocEditForm.vue';
import DocViewer from '/imports/client/ui/docs/DocViewer.vue';
import DocBreadcrumbs from '/imports/client/ui/docs/DocBreadcrumbs.vue';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);
const route = useRoute();

const { ready: docsReady } = subscribe('docs');

const path = computed(() => route.params.docPath as string | undefined);
const root = computed(() => !path.value);

const docNotFound = ref(false);

const { result: docs } = autorun(() => {
  const docList: any[] = [];
  docNotFound.value = false;
  if (root.value) return docList;
  let currentDoc: any = undefined;
  (path.value as string).split('/').forEach((urlName: string) => {
    currentDoc = Docs.findOne({
      urlName,
      parentId: currentDoc?._id,
      removed: { $ne: true },
    });
    if (currentDoc) {
      docList.push(currentDoc);
    } else {
      docNotFound.value = true;
    }
  });
  return docList;
});

const doc = computed(() => {
  if (!docs.value?.length) return undefined;
  return docs.value[docs.value.length - 1];
});

const { result: childDocs } = autorun(() => {
  if (!doc.value) {
    return Docs.find({
      parentId: undefined,
      removed: { $ne: true },
    }, { sort: { left: 1 } }).fetch();
  }
  return Docs.find({
    parentId: doc.value._id,
    removed: { $ne: true },
  }, { sort: { left: 1 } }).fetch();
});

const { result: siblingDocs } = autorun(() => {
  if (!doc.value) return [];
  return Docs.find({
    parentId: doc.value.parentId,
    removed: { $ne: true },
  }, { sort: { left: 1 } }).fetch();
});

const { result: editing } = autorun(() => Session.get('editingDocs'));

const title = computed(() => {
  if (doc.value) {
    return doc.value.name;
  } else if (docNotFound.value) {
    return 'Doc not found';
  } else {
    return 'Documentation';
  }
});

watch(title, (value) => {
  store.commit('setPageTitle', value);
}, { immediate: true });
</script>

<template>
  <v-container class="documentation">
    <v-row justify="center">
      <v-col
        cols="12"
        md="8"
      >
        <doc-breadcrumbs :doc="doc" />
      </v-col>
    </v-row>
    <v-fade-transition mode="out-in">
      <v-progress-circular
        v-if="!docsReady"
        key="loading"
        indeterminate
        color="primary"
        size="32"
      />
      <v-row
        v-else-if="docNotFound"
        key="failed"
        justify="center"
      >
        <v-col
          cols="12"
          md="8"
        >
          <h1>Documentation not found</h1>
        </v-col>
      </v-row>
      <doc-edit-form
        v-else-if="editing"
        key="editing"
        :doc="doc"
        :child-docs="childDocs"
      />
      <doc-viewer
        v-else
        key="viewing"
        :doc="doc"
        :child-docs="childDocs"
        :sibling-docs="siblingDocs"
      />
    </v-fade-transition>
  </v-container>
</template>

<style>
.documentation .fade-transition-enter-active {
  transition: all .25s linear !important;
}

.documentation .fade-transition-leave-active {
  transition: all .1s linear !important;
}
</style>
