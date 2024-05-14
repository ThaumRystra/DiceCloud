<template lang="html">
  <v-container
    v-if="!$subReady.tabletop"
    key="Tabletop"
    fluid
    class="fill-height"
    align="center"
    justify="center"
  >
    <v-row>
      <v-col cols="1">
        <v-progress-circular indeterminate />
      </v-col>
    </v-row>
  </v-container>
  <tabletop-component
    v-else-if="tabletop"
    :model="tabletop"
  />
  <v-container
    v-else
    fluid
    class="fill-height"
    align="center"
    justify="center"
  >
    <v-row
      class="pa-4"
    >
      <v-col
        cols="12"
        md="8"
      >
        <p>This tabletop was not found</p>
        <p>Either it does not exist, or you do not have permission to view it</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="js">
import Tabletops from '/imports/api/tabletop/Tabletops';
import TabletopComponent from '/imports/client/ui/tabletop/TabletopComponent.vue';

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
