<template>
  <div
    class="d-flex align-center"
  >
    <hexagon-progress-stack
      :bars="healthBars || []"
      style="z-index: 1; width: 60px; height: 60px; margin-right: -16px"
    >
      <v-img
        :src="model.picture || '/images/ui/missing-portrait.png'"
        lazy-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAXdJREFUWEftlq1vAkEQxedSB7pYDklBNsgmyCa4Cv5GBI6k8tJKUglULrWcBlvySA4B+/HeAcV07O3t/ObtvNnNHsyc3TEyAGRm+T0Yfs3WFwE0mk3bbbe12WsDtDsda+e5PbZaR4C1c/a9XEowtQC6vZ499ftniaCECiEDoPLnwSBa5WdRWLnZUErIAK+jkeHcY4HkgGBCAmCqr5KyKkgAobP3VXoTAJw9VGBitVhQjpAUeBkOD7Zj4sc5+5rPk0slAOUIkBwQqZAAUD1UYOImALAfbMjE+2xGjWhJASRmGpFtQOwnAzAqTCcTRqTDGhkAP8UGklK9BIDKq9svZUVcShjHZVkmnUApoNjvVHvAfBRFsCGTAJckr2AAAVf4Igqg+D7VdaHJGAVQRm8KIKRCFOBtPE7tK3333ZBBAOXuZyl8Fv1TAF8fBAGYkctWXq3zPdWCANdswJgdgwDM41NVwOeEf4BoE6be/3WO4PSdeARQN7vm+j0BlQ9wWvLB6AAAAABJRU5ErkJggg=="
        class="align-end"
        :class="{placeholder: !model.picture}"
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
        position="top center"
      />
    </hexagon-progress-stack>
    <v-card
      class="flex-grow-1"
      style="margin: 16px 16px 16px 0px;"
    >
      <div style="margin: 8px 8px 8px 24px;">
        {{ model.name }}
      </div>
    </v-card>
  </div>
</template>

<script lang="js">
import HexagonProgressStack from '/imports/client/ui/components/HexagonProgressStack.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

export default {
  components: { 
    HexagonProgressStack,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  meteor: {
    healthBars() {
      const folderIds = CreatureProperties.find({
        'root.id': this.model._id,
        type: 'folder',
        groupStats: true,
        hideStatsGroup: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, { fields: { _id: 1 } }).map(folder => folder._id);
      // Get the properties that need to be shown as a health bar
      return CreatureProperties.find({
        'root.id': this.model._id,
        'parentId': {
          $nin: folderIds,
        },
        type: 'attribute',
        attributeType: 'healthBar',
        healthBarNoDamage: { $ne: true },
        inactive: { $ne: true },
        removed: { $ne: true },
      }, {
        sort: {
          order: 1,
        },
      });
    }
  },
};
</script>

<style scoped>

</style>