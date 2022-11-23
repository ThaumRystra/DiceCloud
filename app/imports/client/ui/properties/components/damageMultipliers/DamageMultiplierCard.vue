<template lang="html">
  <div>
    <v-card>
      <v-list>
        <v-list-item
          v-for="multiplier in multipliers"
          :key="multiplier._id"
          :data-id="multiplier._id"
          @click="$emit('click-multiplier', {_id: multiplier._id})"
        >
          <v-list-item-content>
            <v-list-item-title>
              {{ title(multiplier) }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="multiplier.name">
              {{ multiplier.name }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="d-flex flex-wrap align-center">
              <v-chip
                v-for="(damageType, index) in multiplier.damageTypes"
                :key="index"
                class="my-1 mr-1"
                style="cursor: pointer"
                :input-value="true"
                outlined
                small
                label
              >
                {{ damageType }}
              </v-chip>
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="multiplier.includeTags && multiplier.includeTags.length"
              class="d-flex flex-wrap align-center"
            >
              <div>
                For:
              </div>
              <v-chip
                v-for="(damageType, index) in multiplier.includeTags"
                :key="index"
                class="ma-1"
                style="cursor: pointer"
                :input-value="true"
                small
                outlined
              >
                {{ damageType }}
              </v-chip>
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="multiplier.excludeTags && multiplier.excludeTags.length"
              class="d-flex flex-wrap align-center"
            >
              <div>
                Except:
              </div>
              <v-chip
                v-for="(damageType, index) in multiplier.excludeTags"
                :key="index"
                class="ma-1"
                style="cursor: pointer"
                :input-value="true"
                small
                outlined
              >
                {{ damageType }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script lang="js">
export default {
  props: {
    multipliers:{
      type: Array,
      required: true,
    }
  },
  methods: {
    title(prop){
      switch (prop.value){
        case 0: return 'Immunity';
        case 0.5: return 'Resistance';
        case 2: return 'Vulnerability';
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
