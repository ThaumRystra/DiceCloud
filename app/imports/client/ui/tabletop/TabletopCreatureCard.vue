<template lang="html">
  <v-card
    :style="`height: ${height}px; width: ${width}px;`"
    class="tabletop-creature-card"
    :class="{ active }"
    :hover="hasClickListener"
    :elevation="active ? 8 : 2"
    @mouseover="() => { if (hasClickListener) hover = true; }"
    @mouseleave="hover = false"
    v-on="hasClickListener ? {click: () => $emit('click')} : {}"
  >
    <v-img
      :src="model.picture || '/images/ui/missing-portrait.png'"
      :lazy-src="loadingImg"
      :height="height"
      :width="width"
      class="align-end"
      :class="{placeholder: !model.picture}"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      position="top center"
    >
      <v-card-title
        class="small-title"
        v-text="model.name"
      />
      <health-bar-progress
        v-for="bar in healthBars"
        :key="bar._id"
        :model="bar"
        :height="4"
        style="opacity: 0.7; margin-top: 2px"
      />
    </v-img>
    <div class="d-flex justify-center">
      <v-scale-transition>
        <v-btn
          v-if="showTargetBtn"
          :color="targeted ? 'accent' : ''"
          :elevation="targeted ? 8 : 2"
          fab
          small
          @click.stop.prevent="targeted ? $emit('untarget') : $emit('target')"
        >
          <v-icon>{{ targeted ? 'mdi-target' : 'mdi-target' }}</v-icon>
        </v-btn>
      </v-scale-transition>
    </div>
  </v-card>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
import HealthBarProgress from '/imports/client/ui/properties/components/attributes/HealthBarProgress.vue';

export default {
  components: {
    CardHighlight,
    HealthBarProgress,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    height: {
      type: Number,
      default: 100,
    },
    width: {
      type: Number,
      default: 75,
    },
    active: Boolean,
    targeted: Boolean,
    showTargetBtn: Boolean,
  },
  data(){return {
    hover: false,
    loadingImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAXdJREFUWEftlq1vAkEQxedSB7pYDklBNsgmyCa4Cv5GBI6k8tJKUglULrWcBlvySA4B+/HeAcV07O3t/ObtvNnNHsyc3TEyAGRm+T0Yfs3WFwE0mk3bbbe12WsDtDsda+e5PbZaR4C1c/a9XEowtQC6vZ499ftniaCECiEDoPLnwSBa5WdRWLnZUErIAK+jkeHcY4HkgGBCAmCqr5KyKkgAobP3VXoTAJw9VGBitVhQjpAUeBkOD7Zj4sc5+5rPk0slAOUIkBwQqZAAUD1UYOImALAfbMjE+2xGjWhJASRmGpFtQOwnAzAqTCcTRqTDGhkAP8UGklK9BIDKq9svZUVcShjHZVkmnUApoNjvVHvAfBRFsCGTAJckr2AAAVf4Igqg+D7VdaHJGAVQRm8KIKRCFOBtPE7tK3333ZBBAOXuZyl8Fv1TAF8fBAGYkctWXq3zPdWCANdswJgdgwDM41NVwOeEf4BoE6be/3WO4PSdeARQN7vm+j0BlQ9wWvLB6AAAAABJRU5ErkJggg==',
  }
  },
  computed: {
    hasClickListener() {
      return this.$listeners && !!this.$listeners.click;
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
        inactive: { $ne: true } ,
        removed: { $ne: true },
        total: {$ne: 0},
      }, {
        sort: {
          order: 1,
        },
      });
    }
  }
}
</script>

<style lang="css" scoped>
.small-title {
  font-size: 12px;
  padding: 4px 4px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  line-height: normal;
}
.active {
  transform: scale(1.2);
  margin-left: 12px !important;
  margin-right: 12px !important;
  transform-origin: top center;
}
.tabletop-creature-card {
  transition: all .15s ease;
}
</style>

<style lang="css">
.tabletop-creature-card .v-btn {
  transition: all .3s ease;
}
</style>
