<template lang="html">
  <div class="results inline">
    <span
      v-if="model.damages && model.damages.length"
      class="damages"
    >
      <span
        v-for="damage in model.damages"
        :key="damage._id"
        class="damage"
      >
        <computed
          :value="damage.damage"
          :expect-number="false"
          class="inline"
        />
        {{ damage.damageType }} damage
      </span>
    </span>
    <span
      v-if="model.adjustments && model.adjustments.length"
      class="adjustments"
    >
      <span
        v-for="adjustment in model.adjustments"
        :key="adjustment._id"
        class="adjustment"
      >
        <computed
          :value="adjustment.adjustment"
          signed
          :expect-number="false"
          class="inline"
        />
        {{ adjustment.stat }}
      </span>
    </span>
    <span
      v-if="model.buffs && model.buffs.length"
      class="buffs"
    >
      <span
        v-for="buff in model.buffs"
        :key="buff._id"
        class="buff"
      >
        {{ buff.name }}
      </span>
    </span>
  </div>
</template>

<script>
  import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';

  export default {
    components: {
      Computed: ComputedForCreature,
    },
    props: {
      model: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<style lang="css" scoped>
  .inline {
    display: inline;
  }
</style>
