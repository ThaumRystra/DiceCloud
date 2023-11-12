<template>
  <v-row
    justify="center"
    class="doc-viewer"
  >
    <v-col
      cols="12"
      lg="8"
      class="pt-0"
    >
      <div class="sibling-list-parent">
        <v-card
          class="sibling-list"
        >
          <v-fade-transition mode="out-in">
            <v-list
              v-if="siblingDocs.length > 1"
              :dense="siblingDocs.length > 5"
            >
              <doc-list-item
                v-for="sibling in siblingDocs"
                :key="sibling._id"
                :doc="sibling"
                :icon="siblingHasIcon"
              />
            </v-list>
          </v-fade-transition>
        </v-card>
      </div>
      <v-fade-transition mode="out-in">
        <div
          :key="doc && doc.name || 'Documentation Home'"
          class="d-flex align-center mb-4"
        >
          <v-avatar
            v-if="(doc && doc.icon) || (!doc)"
            size="56"
          >
            <svg-icon
              v-if="doc && doc.icon"
              large
              :shape="doc.icon.shape"
            />
            <v-icon
              v-else-if="!doc"
              large
            >
              mdi-home
            </v-icon>
          </v-avatar>
          <h1
            v-if="doc"
          >
            {{ doc.name }}
          </h1>
          <h1
            v-else
          >
            Documentation
          </h1>
        </div>
      </v-fade-transition>
      <v-fade-transition mode="out-in">
        <markdown-text
          v-if="doc"
          :key="doc._id"
          :markdown="doc.description"
          @click="mdClick"
        />
      </v-fade-transition>
    </v-col>
    <v-col 
      cols="12"
      lg="8"
    >
      <v-fade-transition
        mode="out-in"
        leave-absolute
        hide-on-leave
      >
        <v-row :key="doc && doc._id">
          <v-col
            v-for="child in childDocs"
            :key="child._id"
            cols="12"
            sm="6"
            md="4"
            xl="3"
          >
            <doc-card :doc="child" />
          </v-col>
        </v-row>
      </v-fade-transition>
    </v-col>
  </v-row>
</template>

<script lang="js">
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import DocCard from '/imports/client/ui/docs/DocCard.vue';
import DocListItem from '/imports/client/ui/docs/DocListItem.vue';
import { find } from 'lodash';

export default {
  components: {
    DocListItem,
    MarkdownText,
    DocCard,
  },
  props: {
    doc: {
      type: Object,
      default: undefined,
    },
    childDocs: {
      type: Array,
      required: true,
    },
    siblingDocs: {
      type: Array,
      required: true,
    },
  },
  computed: {
    siblingHasIcon() {
      return !!find(this.siblingDocs, doc => doc.icon);
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
    },
  }
}
</script>

<style lang="css" scoped>
@media (min-width: 500px) {
  .sibling-list-parent {
    float: right;
    z-index: 4;
  }
  .sibling-list {
    display: block !important;
  }
}
.sibling-list-parent {
  text-align: right;
  margin: 0 16px 8px;
}
.sibling-list {
  text-align: left;
  display: inline-block;
}
</style>