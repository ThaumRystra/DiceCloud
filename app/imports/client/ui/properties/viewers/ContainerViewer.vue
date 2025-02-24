<template lang="html">
  <div class="container-viewer">
    <v-row dense>
      <property-field
        :name="$t('ConstantForm.aEv2NC1UXKBC9Z63kT9Jb')"
        :cols="{cols: 12, md: 6}"
      >
        <div style="overflow: hidden;">
          <v-layout
            v-if="model.value !== undefined"
            align-center
            class="mb-2"
          >
            <v-icon
              class="mr-2"
              large
            >
              $vuetify.icons.two_coins
            </v-icon>
            <coin-value
              class="text-subtitle-1 mr-2"
              :value="model.value"
            />
          </v-layout>
          <v-layout align-center>
            <v-icon
              class="mr-2"
              large
            >
              $vuetify.icons.cash
            </v-icon>
            <coin-value
              class="text-subtitle-1 mr-2"
              :value="model.contentsValue"
            />
            <span class="text-subtitle-1">
              contents
            </span>
          </v-layout>
        </div>
      </property-field>
      <property-field
        :name="$t('ContainerForm.7KxFeshSgsphebWl6Y_Bt')"
        :cols="{cols: 12, md: 6}"
      >
        <div style="overflow: hidden;">
          <v-layout
            v-if="model.weight !== undefined"
            align-center
            class="mb-2"
          >
            <v-icon
              class="mr-2"
              large
            >
              $vuetify.icons.weight
            </v-icon>
            <span class="text-subtitle-1 mr-2">
              {{ $t('ContainerViewer.iaSo2F9hn7VmSSzfwSvT1', [model.weight]) }}
            </span>
          </v-layout>
          <v-layout
            align-center
            :class="{'mb-2': model.contentsWeightless}"
          >
            <v-icon
              class="mr-2"
              large
            >
              $vuetify.icons.injustice
            </v-icon>
            <span class="text-subtitle-1 mr-2">
              {{ $t('ContainerViewer.lp8QWZHKDIXv42JsZlygP', [model.contentsWeight]) }}
            </span>
            <span class="text-subtitle-1">
              contents
            </span>
          </v-layout>
        </div>
      </property-field>
      <property-field
        v-if="model.carried"
        value="Carried"
      />
      <property-field v-if="model.contentsWeightless">
        <v-icon
          style="overflow: hidden;"
          class="ma-1"
        >
          $vuetify.icons.weightless
        </v-icon>
        <span class="ml-1">{{ $t('ContainerViewer.4zYbcpuZsRCmGn4ZdMZgd') }}</span>
      </property-field>
      <property-description
        :name="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import CoinValue from '/imports/client/ui/components/CoinValue.vue';
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
export default {
  components: {
    CoinValue,
  },
  mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>

</style>
