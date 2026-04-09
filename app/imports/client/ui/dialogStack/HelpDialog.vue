<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-icon
        class="mr-2"
      >
        mdi-help
      </v-icon>
      <v-toolbar-title>
        Help: {{ title }}
      </v-toolbar-title>
    </template>
    <div>
      <v-progress-circular
        v-if="!doc && !docsReady"
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
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        @click="store.dispatch('popDialogStack')"
      >
        Close
      </v-btn>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { autorun, subscribe } from 'vue-meteor-tracker';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { propsByDocsPath } from '/imports/constants/PROPERTIES';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import Docs from '/imports/api/docs/Docs';

const store = useStore();

const props = defineProps<{
  path: string;
}>();

const { ready: docsReady } = subscribe(() => ['docs', props.path]);

const doc = ref<string | undefined>(undefined);
autorun(() => {
  const docItem = Docs.findOne({ href: '/docs/' + props.path });
  doc.value = docItem?.description;
});

const prop = computed(() => propsByDocsPath.get(props.path));

const title = computed(() => {
  if (prop.value) {
    return prop.value.name;
  } else {
    const titleCase = props.path.replace(
      /(\w*)(\W+)/g,
      function (_txt: string, word: string) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase() + ' ';
      }
    );
    return titleCase || 'Character Sheet';
  }
});

function linkClick(e: Event) {
  const target = e.target as HTMLAnchorElement | null;
  const href = target?.href;
  if (!href) return;
  const path = href.split('/docs/')[1];
  if (!path) return;
  e.preventDefault();
  if (target) target.dataset.id = path;
  store.commit('pushDialogStack', {
    component: 'help-dialog',
    elementId: path,
    data: { path },
  });
}
</script>

<style lang="css" scoped>

</style>
