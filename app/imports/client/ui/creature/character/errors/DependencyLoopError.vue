<template>
  <v-alert
    border="bottom"
    colored-border
    elevation="2"
    type="warning"
    class="dependency-loop-error"
  >
    <p>
      The character contains a dependency loop.
    </p>
    <p>
      A set of properties may have been calculated incorrectly, because they form an infinite loop:
    </p>
    <div class="d-flex align-center flex-wrap">
      <template
        v-for="(prop, index) in loopProperties"
      >
        <v-icon
          v-if="index !== 0"
          :key="index"
        >
          mdi-chevron-right
        </v-icon>
        <a
          v-if="prop.type"
          :key="index + 'link'"
          :data-id="`breadcrumb-${prop._id}`"
          @click="click(prop._id)"
        >
          <tree-node-view
            :model="prop"
            class="breadcrumb-tree-node-view"
          />
        </a>
        <span
          v-else
          :key="index + 'variable'"
          style="font-family: monospace !important;"
        >
          {{ prop.name }} {{ prop.path }}
        </span>
      </template>
    </div>
  </v-alert>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import { reverse } from 'lodash';

export default {
  components: {
    TreeNodeView,
  },
  inject: {
    theme: {
      default: {
        isDark: false,
      },
    },
  },
  props: {
    model: {
      type: Object,
      default: undefined,
    }
  },
  meteor: {
    loopProperties() {
      if (!this.model) return;
      const propAddresses = this.model.details?.nodes || [];
      const props = propAddresses.map(propAddress => {
        const [id, ...path] = propAddress.split('.');
        const prop = CreatureProperties.findOne(id);
        if (prop) {
          prop.path = path && path.join('.');
          if (prop.name && prop.path) prop.name += ` [${prop.path}]`;
          return prop;
        } else {
          return { name: propAddress };
        }
      });
      return reverse(props);
    }
  },
  methods: {
    click(id){
      // Otherwise open it as a new dialog
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `breadcrumb-${id}`,
        data: {_id: id},
      });
    },
  }
}
</script>

<style>
</style>
