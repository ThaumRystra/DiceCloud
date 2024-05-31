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
            v-else-if="!$subReady.docs"
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

<script lang="js">
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import Docs from '/imports/api/docs/Docs';
import { propsByDocsPath } from '/imports/constants/PROPERTIES';

export default {
  components: {
    MarkdownText,
  },
  data() {
    return {
      action: undefined,
    };
  },
  computed: {
    path() {
      return this.$route.params.docPath || 'docs';
    },
    prop() {
      return propsByDocsPath.get(this.path);
    },
    title() {
      if (this.prop) {
        return this.prop.name + ' Docs';
      } else {
        const titleCase = this.path.replace(
          /(\w*)(\W+)/g,
          function (txt, word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase() + ' ';
          }
        );
        return titleCase || 'DiceCloud Docs';
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
      const doc = Docs.findOne(this.path);
      return doc && doc.description;
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
  methods: {
    mdClick(e) {
      const target = e.target || e.srcElement;
      const href = target && target.href;
      if (!href) return;
      const path = href.split('/docs/')[1];
      if (!path) return;
      e.preventDefault();
      this.$router.push('/docs/' + path);
    }
  }
}
</script>
