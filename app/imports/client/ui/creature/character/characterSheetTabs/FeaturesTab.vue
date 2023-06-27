<template lang="html">
  <div class="features">
    <column-layout wide-columns>
      <folder-group-card
        v-for="folder in startFolders"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />
      <div
        v-for="feature in features"
        :key="feature._id"
      >
        <feature-card
          :model="feature"
          :data-id="feature._id"
          @click="featureClicked(feature)"
        />
      </div>
      <folder-group-card
        v-for="folder in endFolders"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />
    </column-layout>
  </div>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import FeatureCard from '/imports/client/ui/properties/components/features/FeatureCard.vue';
import tabFoldersMixin from '/imports/client/ui/properties/components/folders/tabFoldersMixin.js';

export default {
  components: {
    ColumnLayout,
    FeatureCard,
  },
  mixins: [tabFoldersMixin],
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      tabName: 'features',
    };
  },
  meteor: {
    features() {
      const folderIds = CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'folder',
        groupStats: true,
        hideStatsGroup: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, { fields: { _id: 1 } }).map(folder => folder._id);
      
      return CreatureProperties.find({
        'ancestors.id': {
          $eq: this.creatureId,
        },
        'parent.id': {
          $nin: folderIds,
        },
        type: 'feature',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { order: 1 }
      });
    },
  },
  methods: {
    featureClicked({ _id }) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${_id}`,
        data: { _id },
      });
    },
  },
};
</script>

<style lang="css" scoped>

</style>
