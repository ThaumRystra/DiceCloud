<template lang="html">
  <div>
    <div
      v-for="(multiplier, multiplierIndex) in multipliers"
      :key="multiplier._id"
      :data-id="multiplier._id"
      @click="$emit('click-multiplier', {_id: multiplier._id})"
    >
      <v-divider v-if="multiplierIndex" />
      <div>
        <div
          v-if="multiplier.name"
          class="label text-center"
        >
          {{ multiplier.name }}
        </div>
        <div class="font-weight-medium">
          {{ title(multiplier) }}
        </div>
        <div class="d-flex flex-wrap align-center">
          {{ multiplier.damageTypes.join(', ') }}
        </div>
        <div
          v-if="multiplier.includeTags && multiplier.includeTags.length"
          class="d-flex flex-wrap align-center"
        >
          <div>
            For:
          </div>
          {{ multiplier.includeTags.join(', ') }}
        </div>
        <div
          v-if="multiplier.excludeTags && multiplier.excludeTags.length"
          class="d-flex flex-wrap align-center"
        >
          <div>
            Except:
          </div>
          {{ multiplier.excludeTags.join(', ') }}
        </div>
      </div>
    </div>
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
.label {
  font-size: 10pt;
  font-variant: small-caps;
}
</style>
