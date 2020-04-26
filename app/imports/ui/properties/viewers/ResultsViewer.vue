<template lang="html">
  <div class="results">
    <div
      v-if="model.damages.length"
      class="damages"
    >
      <div class="caption">
        Damage
      </div>
      <div class="mb-3">
        <div
          v-for="damage in model.damages"
          :key="damage._id"
          class="damage ml-2 subheading"
        >
          <computed
            :value="damage.damage"
            :expect-number="false"
            class="d-inline"
          /> {{ damage.damageType }} damage
        </div>
      </div>
    </div>
    <div
      v-if="model.adjustments.length"
      class="adjustments"
    >
      <div class="caption">
        Attribute Damage
      </div>
      <p
        v-for="adjustment in model.adjustments"
        :key="adjustment._id"
        class="adjustment ml-2 subheading"
      >
        <computed
          :value="adjustment.adjustment"
          class="d-inline"
          signed
        /> to {{ adjustment.stat }}
      </p>
    </div>
    <div
      v-if="model.buffs.length"
      class="buffs"
    >
      <div class="caption">
        Buffs
      </div>
      <div
        v-for="buff in model.buffs"
        :key="buff._id"
        class="buff mb-3"
      >
        <div class="subheading">
          {{ buff.name }}
        </div>
        <property-field
          name="Duration"
          :value="buff.duration"
        />
        <property-description :value="buff.description" />
        <effect-viewer
          v-for="effect in buff.effects"
          :key="effect._id"
          :model="effect"
        />
      </div>
    </div>
  </div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
import EffectViewer from '/imports/ui/properties/viewers/EffectViewer.vue';
import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';

export default {
  components: {
    EffectViewer,
    Computed: ComputedForCreature,
  },
  mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>
</style>
