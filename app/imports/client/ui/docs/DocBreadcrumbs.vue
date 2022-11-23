<template>
  <v-breadcrumbs
    :items="items"
    divider=">"
  />
</template>

<script lang="js">

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
        text: 'Home',
        to: '/docs',
        exact: true,
      }];
      if (!this.doc?.ancestors) return items;
      const address = ['/docs']
      this.doc.ancestors?.forEach(a => {
        address.push(a.urlName);
        items.push({
          text: a.name,
          to: address.join('/'),
          exact: true,
        });
      });
      address.push(this.doc.urlName);
      items.push({
        text: this.doc.name,
        to: address.join('/'),
        exact: true,
      });
      return items;
    }
  },
}
</script>