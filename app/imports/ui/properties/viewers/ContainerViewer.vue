<template lang="html">
  <div class="container-viewer">
    <property-tags :tags="model.tags" />
    <div class="layout row wrap justify-space-around">
      <div
        class="mr-3 my-3"
      >
        <v-layout
          v-if="model.value !== undefined"
          row
          align-center
          class="mb-2"
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
        <v-layout
          row
          align-center
        >
          <v-icon
            class="mr-2"
            x-large
          >
            $vuetify.icons.cash
          </v-icon>
          <coin-value
            class="title mr-2"
            :value="model.contentsValue"
          />
          <span class="title">
            contents
          </span>
        </v-layout>
      </div>
      <div
        class="my-3"
      >
        <v-layout
          v-if="model.weight !== undefined"
          row
          align-center
          justify-end
          class="mb-2"
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
        <v-layout
          row
          align-center
          justify-end
        >
          <template v-if="model.contentsWeightless">
            <span
              class="title"
            >
              contents weightless
            </span>
          </template>
          <template v-else>
            <span class="title mr-2">
              {{ model.contentsWeight }} lb
            </span>
            <span
              class="title"
            >
              contents
            </span>
          </template>
          <v-icon
            class="ml-2"
            x-large
          >
            $vuetify.icons.injustice
          </v-icon>
        </v-layout>
      </div>
    </div>
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
      :inactive="model.inactive"
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
