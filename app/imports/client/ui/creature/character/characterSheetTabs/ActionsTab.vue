<template lang="html">
  <div
    class="actions-tab ma-2"
  >
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
        v-for="action in actions"
        :key="action._id"
        class="action"
      >
        <action-card
          :model="action"
          :data-id="action._id"
          @click="clickProperty({_id: action._id})"
          @sub-click="_id => clickTreeProperty({_id})"
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
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import ActionCard from '/imports/client/ui/properties/components/actions/ActionCard.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import tabFoldersMixin from '/imports/client/ui/properties/components/folders/tabFoldersMixin.js';

export default {
  components: {
    ColumnLayout,
    ActionCard,
  },
  mixins: [tabFoldersMixin],
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  data() { return {
    tabName: 'actions',
  }},
  meteor: {
    actions() {
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'action',
        actionType: { $ne: 'event' },
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { actionType: 1, order: 1 },
      });
    }
  },
};
</script>
