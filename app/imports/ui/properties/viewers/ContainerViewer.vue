<template lang="html">
  <div class="container-viewer">
    <property-tags :tags="model.tags" />
    <div class="layout row wrap justify-space-around">
      <div
        v-if="model.value !== undefined"
        class="mr-3 my-3"
      >
        <v-layout
          row
          align-center
        >
          <v-icon
            class="mr-2"
            x-large
          >
            $vuetify.icons.two_coins
          </v-icon>
          <coin-value
            class="title mr-2"
            :value="model.value"
          />
        </v-layout>
      </div>
      <div
        v-if="model.weight !== undefined"
        class="my-3"
      >
        <v-layout
          row
          align-center
          justify-end
        >
          <span class="title mr-2">
            {{ model.weight }} lb
          </span>
          <v-icon
            class="ml-2"
            x-large
          >
            $vuetify.icons.weight
          </v-icon>
        </v-layout>
      </div>
    </div>
    <property-description
      v-if="model.description"
      :value="model.description"
    />
  </div>
</template>

<script>
import CoinValue from '/imports/ui/components/CoinValue.vue';
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
export default {
  components: {
    CoinValue,
  },
	mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>
</style>
