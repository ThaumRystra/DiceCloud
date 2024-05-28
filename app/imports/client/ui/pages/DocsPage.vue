<template>
  <v-container class="documentation">
    <v-row
      justify="center"
    >
      <v-col
        cols="12"
        md="8"
      >
        <doc-breadcrumbs :doc="doc" />
      </v-col>
    </v-row>
    <v-fade-transition mode="out-in">
      <v-progress-circular
        v-if="!$subReady.docs"
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

<script lang="js">
import Docs from '/imports/api/docs/Docs';
import DocEditForm from '/imports/client/ui/docs/DocEditForm.vue';
import DocViewer from '/imports/client/ui/docs/DocViewer.vue';
import DocBreadcrumbs from '/imports/client/ui/docs/DocBreadcrumbs.vue';
import { Session } from 'meteor/session';

export default {
  components: {
    DocBreadcrumbs,
    DocViewer,
    DocEditForm,
  },
  data() { return {
    docNotFound: false,
  }},
  computed: {
    path() {
      return this.$route.params.docPath;
    },
    doc() {
      if (!this.docs?.length) return;
      return this.docs[this.docs.length - 1];
    },
    title() {
      if (this.doc) {
        return this.doc.name;
      } else if (this.docNotFound) {
        return 'Doc not found';
      } else {
        return 'Documentation'
      }
    },
    root() {
      return !this.path;
    }
  },
  meteor: {
    $subscribe: {
      'docs': [],
    },
    docs() {
      const docs = [];
      this.docNotFound = false;
      if (this.root) {
        return docs;
      }
      let currentDoc = undefined;
      this.path.split('/').forEach(urlName => {
        currentDoc = Docs.findOne({
          urlName, 'parentId': currentDoc?._id,
          removed: { $ne: true },
        })
        if (currentDoc) {
          docs.push(currentDoc);
        } else {
          this.docNotFound = true;
        }
      });
      return docs;
    },
    childDocs() {
      if (!this.doc) return Docs.find({
        'parentId': undefined,
        removed: { $ne: true },
      }, {
        sort: { left: 1 }
      });
      return Docs.find({
        'parentId': this.doc._id,
        removed: { $ne: true },
      }, {
        sort: { left: 1 }
      })
    },
    siblingDocs() {
      if (!this.doc) return [];
      return Docs.find({
        'parentId': this.doc.parentId,
        removed: { $ne: true },
      }, {
        sort: { left: 1 }
      });
    },
    editing() {
      return Session.get('editingDocs');
    },
  },
  watch: {
    title: {
      immediate: true,
      handler(value) {
        this.$store.commit('setPageTitle', value);
      }
    }
  },
}
</script>

<style>
.documentation .fade-transition-enter-active {
  transition: all .25s linear !important;
}
.documentation .fade-transition-leave-active {
  transition: all .1s linear !important;
}
</style>