<template>
  <v-breadcrumbs
    :items="items"
    divider=">"
  />
</template>

<script lang="js">
import Docs from '/imports/api/docs/Docs';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default {
  props: {
    doc: {
      type: Object,
      default: undefined,
    },
  },
  computed: {
    items() {
      const items = [{
        text: 'Docs',
        to: '/docs',
        exact: true,
      }];
      if (!this.doc) return items;

      const ancestors = Docs.find({
        ...getFilter.ancestors(this.doc)
      }).fetch();
      
      ancestors.forEach(a => {
        items.push({
          text: a.name,
          to: a.href,
          exact: true,
        });
      });
      
      items.push({
        text: this.doc.name,
        to: this.doc.href,
        exact: true,
      });
      return items;
    }
  },
}
</script>