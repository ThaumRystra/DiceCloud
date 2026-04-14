<script setup lang="ts">
import { useRoute } from 'vue-router';
import { autorun, subscribe } from 'vue-meteor-tracker';
import Tabletops from '/imports/api/tabletop/Tabletops';
import TabletopComponent from '/imports/client/ui/tabletop/TabletopComponent.vue';

const route = useRoute();
const { ready: tabletopReady } = subscribe(() => ['tabletop', route.params.id as string]);
const { result: tabletop } = autorun(() => Tabletops.findOne(route.params.id as string));
</script>

<template lang="html">
  <v-fade-transition mode="out-in">
    <v-container
      v-if="!tabletopReady"
      key="Loading"
      fluid
      class="fill-height align justify"
    >
      <v-row justify="center">
        <v-col cols="1">
          <v-progress-circular
            :size="100"
            :width="10"
            color="primary"
            style="opacity: 0.5"
            indeterminate
          />
        </v-col>
      </v-row>
    </v-container>
    <tabletop-component
      v-else-if="tabletop"
      key="Tabletop"
      :model="tabletop"
    />
    <v-container
      v-else
      key="Not Found"
      fluid
      class="fill-height align justify"
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
  </v-fade-transition>
</template>
