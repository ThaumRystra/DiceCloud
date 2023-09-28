<template lang="html">
  <dialog-base>
    <v-icon
      slot="toolbar"
      class="mr-2"
    >
      mdi-help
    </v-icon>
    <v-toolbar-title slot="toolbar">
      Help: {{ title }}
    </v-toolbar-title>
    <div>
      <v-progress-circular
        v-if="!doc && !$subReady.docs"
        indeterminate
        color="primary"
        size="32"
      />
      <div v-else-if="!doc">
        Help document not found for {{ title }}
      </div>
      <markdown-text
        v-else
        :markdown="doc"
        @click="linkClick"
      />
    </div>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      @click="$store.dispatch('popDialogStack')"
    >
      Close
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { propsByDocsPath } from '/imports/constants/PROPERTIES';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import Docs from '/imports/api/docs/Docs';

export default {
  components: {
    DialogBase,
    MarkdownText,
  },
  props: {
    path: {
      type: String,
      required: true,
    }
  },
  computed: {
    prop() {
      return propsByDocsPath.get(this.path);
    },
    title() {
      if (this.prop) {
        return this.prop.name;
      } else {
        const titleCase = this.path.replace(
          /(\w*)(\W+)/g,
          function (txt, word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase() + ' ';
          }
        );
        return titleCase || 'Character Sheet';
      }
    }
  },
  meteor: {
    $subscribe: {
      'docs'() {
        return [this.path];
      },
    },
    doc() {
      const doc = Docs.findOne({href: '/docs/' + this.path});
      return doc && doc.description;
    },
  },
  methods: {
    linkClick(e) {
      const target = e.target || e.srcElement;
      const href = target && target.href;
      if (!href) return;
      const path = href.split('/docs/')[1];
      if (!path) return;
      e.preventDefault();
      target.dataset.id = path;
      this.$store.commit('pushDialogStack', {
        component: 'help-dialog',
        elementId: path,
        data: {
          path,
        },
      });
    },
  },
};
</script>

<style lang="css" scoped>

</style>
