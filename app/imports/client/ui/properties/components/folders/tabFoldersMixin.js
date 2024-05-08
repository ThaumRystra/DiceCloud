import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties'
import FolderGroupCard from '/imports/client/ui/properties/components/folders/FolderGroupCard.vue';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

function getFolders(creatureId, tab, location) {
  return CreatureProperties.find({
    ...getFilter.descendantsOfRoot(creatureId),
    groupStats: true,
    inactive: { $ne: true },
    removed: { $ne: true },
    tab,
    location,
  }, {
    sort: {
      left: 1,
    }
  });
}

export default {
  components: {
    FolderGroupCard,
  },
  meteor: {
    startFolders() {
      return getFolders(this.creatureId, this.tabName, 'start');
    },
    endFolders() {
      return getFolders(this.creatureId, this.tabName, 'end');
    },
  },
  methods: {
    clickProperty({ _id }) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${_id}`,
        data: { _id },
      });
    },
    clickTreeProperty({ _id }) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `tree-node-${_id}`,
        data: { _id },
      });
    },
    softRemove(_id) {
      softRemoveProperty.call({ _id }, error => {
        if (error) {
          snackbar({ text: error.reason || error.message || error.toString() });
          console.error(error);
        }
      });
    },
  }
};