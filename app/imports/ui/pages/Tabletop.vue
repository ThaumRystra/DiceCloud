<template lang="html">
  <div
    class="tabletop-page"
    style="height: 100%;"
  >
    <div
      v-if="!this.$subReady.tabletop"
      class="layout column align-center justify-center"
      style="height: 100%;"
    >
      <v-progress-circular indeterminate />
    </div>
    <tabletop-component
      v-else-if="tabletop"
      :model="tabletop"
    />
    <div
      v-else
      class="pa-4"
    >
      <p>This tabletop was not found</p>
      <p>Either it does not exist, or you do not have permission to view it</p>
    </div>
  </div>
</template>

<script lang="js">
import Tabletops from '/imports/api/tabletop/Tabletops.js';
import TabletopComponent from '/imports/ui/tabletop/TabletopComponent.vue';

export default {
  components: {
    TabletopComponent,
  },
  meteor: {
    tabletop(){
      return Tabletops.findOne(this.$route.params.id);
    },
    $subscribe: {
      'tabletop'(){
        return [this.$route.params.id];
      },
    }
  }
}
</script>
