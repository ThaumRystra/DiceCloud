<template>
  <v-card :data-id="`${model._id}-archive-card`">
    <v-card-title>
      {{ model.meta.creatureName }}
    </v-card-title>
    <v-card-subtitle>
      {{ model.size }}
    </v-card-subtitle>
    <v-card-actions>
      <v-btn
        v-if="characterSlots > 0"
        text
        :loading="restoreLoading"
        @click="restore(model._id)"
      >
        Restore
      </v-btn>
      <v-flex />
      <v-btn
        icon
        @click="removeArchiveCharacter"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-btn
        icon
        :href="`${model.link}?download=true`"
      >
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="js">
import restoreCreatureFromFile from '/imports/api/creature/archive/methods/restoreCreatureFromFile';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { characterSlotsRemaining } from '/imports/api/creature/creatures/methods/assertHasCharacterSlots';
import removeArchiveCreature from '/imports/api/creature/archive/methods/removeArchiveCreature';

export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      restoreLoading: false,
      removeLoading: false,
    }
  },
  meteor: {
    characterSlots() {
      return characterSlotsRemaining(Meteor.userId());
    },
  },
  methods: {
    restore() {
      this.restoreLoading = true;
      restoreCreatureFromFile.call({
        fileId: this.model._id,
      }, error => {
        this.restoreLoading = false;
        if (!error) return;
        console.error(error);
        snackbar({ text: error.reason });
      });
    },
    removeArchiveCharacter() {
      let that = this;
      this.$store.commit('pushDialogStack', {
        component: 'delete-confirmation-dialog',
        elementId: `${that.model._id}-archive-card`,
        data: {
          name: this.model.meta.creatureName,
          typeName: 'Character Archive'
        },
        callback(confirmation) {
          if (!confirmation) return;
          removeArchiveCreature.call({ fileId: that.model._id }, (error) => {
            if (error) console.error(error);
          });
        }
      });
    },
  },
}
</script>
