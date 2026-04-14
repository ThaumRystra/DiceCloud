<script setup lang="ts">
import { computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { autorun, subscribe } from 'vue-meteor-tracker';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import Docs from '/imports/api/docs/Docs';
import { propsByDocsPath } from '/imports/constants/PROPERTIES';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);
const route = useRoute();
const router = useRouter();

const path = computed(() => (route.params.docPath as string) || 'docs');

const { ready: docsReady } = subscribe(() => ['docs', path.value]);

const { result: doc } = autorun(() => {
  const d = Docs.findOne(path.value);
  return d?.description;
});

const prop = computed(() => propsByDocsPath.get(path.value));

const title = computed(() => {
  if (prop.value) {
    return prop.value.name + ' Docs';
  } else {
    const titleCase = path.value.replace(
      /(\w*)(\W+)/g,
      function (_txt: string, word: string) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase() + ' ';
      }
    );
    return titleCase || 'DiceCloud Docs';
  }
});

watch(title, (value) => {
  store.commit('setPageTitle', value);
}, { immediate: true });

function mdClick(e: Event) {
  const target = e.target as HTMLAnchorElement | null;
  const href = target?.href;
  if (!href) return;
  const path = href.split('/docs/')[1];
  if (!path) return;
  e.preventDefault();
  router.push('/docs/' + path);
}
</script>

<template>
  <v-container class="documentation">
    <v-row justify="center">
      <v-col
        cols="12"
        lg="8"
      >
        <v-fade-transition mode="out-in">
          <v-card
            v-if="doc"
            :key="path"
          >
            <v-card-text>
              <markdown-text
                :markdown="doc"
                @click="mdClick"
              />
            </v-card-text>
          </v-card>
          <v-progress-circular
            v-else-if="!docsReady"
            indeterminate
            color="primary"
            size="32"
          />
          <v-card v-else-if="!doc">
            <v-card-title>
              Help document not found for {{ title }}
            </v-card-title>
          </v-card>
        </v-fade-transition>
      </v-col>
    </v-row>
  </v-container>
</template>
