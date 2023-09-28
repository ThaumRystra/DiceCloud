<template lang="html">
  <single-card-layout>
    <library-and-node
      :library-id="$route.params.id"
    />
  </single-card-layout>
</template>

<script lang="js">
import SingleCardLayout from '/imports/client/ui/layouts/SingleCardLayout.vue';
import LibraryAndNode from '/imports/client/ui/library/LibraryAndNode.vue';
import Libraries from '/imports/api/library/Libraries';

export default {
  components: {
    SingleCardLayout,
    LibraryAndNode,
  },
  watch: {
    'library.name'(newName) {
      this.$store.commit('setPageTitle', newName || 'Library');
    },
  },
  mounted() {
    this.$store.commit('setPageTitle', this.library && this.library.name || 'Library');
  },
  meteor: {
    library(){
      let libraryId = this.$route.params.id;
      if (!libraryId) return;
      return Libraries.findOne(libraryId, {fields: {name: 1}});
    },
  }
};
</script>
