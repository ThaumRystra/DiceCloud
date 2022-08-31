<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <markdown-text
              :markdown="doc"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="js">
import MarkdownText from '/imports/ui/components/MarkdownText.vue';
import Docs from '/imports/api/docs/Docs.js';
import { propsByDocsPath } from '/imports/constants/PROPERTIES.js';

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
      return this.$route.params.docPath;
    },
    prop() {
      return propsByDocsPath.get(this.path);
    },
  },
  meteor: {
    $subscribe: {
      'docs'(){
        return [this.path];
      },
    },
    doc() {
      const doc = Docs.findOne(this.path);
      return doc && doc.text;
    },
  },
  watch: {
    path: {
      immediate: true,
      handler(value) {
        if (this.prop) {
          this.$store.commit('setPageTitle', this.prop.name + ' Docs');
        } else {
          const titleCase = value.replace(
            /(\w*)(\W+)/g,
            function(txt, word) {
              return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase() + ' ';
            }
          );
          this.$store.commit('setPageTitle', titleCase || 'Character Sheet');
        }
      }
    }
  }
}
</script>