<template lang="html">
  <div>
    <v-container
      fluid
      grid-list-lg
      fill-height
    >
      <v-layout
        row
        wrap
        fill-height
      >
        <v-flex
          v-for="(property, type) in PROPERTIES"
          :key="type"
          sm4
          xs6
        >
          <v-card
            hover
            style="height: 100%; overflow: hidden;"
            @click="$emit('select', type)"
          >
            <div
              class="layout row align-center justify-center"
              style="min-height: 70px;"
            >
              <v-icon x-large>
                {{ property.icon }}
              </v-icon>
            </div>
            <h3
              class="subtitle pb-3"
              style="text-align: center;"
            >
              {{ property.name }}
            </h3>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import PROPERTIES from '/imports/constants/PROPERTIES.js';
export default {
	data(){return {
		PROPERTIES,
	};},
}
</script>

<style lang="css" scoped>
</style>
