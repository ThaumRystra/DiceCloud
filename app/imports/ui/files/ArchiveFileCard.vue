<template>
  <v-card>
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
        @click="restore(model._id)"
      >
        Restore
      </v-btn>
      <v-flex />
      <v-btn
        icon
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
import restoreCreatureFromFile from '/imports/api/creature/archive/methods/restoreCreatureFromFile.js';
import { snackbar } from '/imports/ui/components/snackbars/SnackbarQueue.js';
import { characterSlotsRemaining } from '/imports/api/creature/creatures/methods/assertHasCharacterSlots.js';

export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data(){return {
    restoreLoading: false,
    removeLoading: false,
  }},
   meteor: {
    characterSlots(){
      return characterSlotsRemaining(Meteor.userId());
    },
   },
  methods: {
    restore(){
      this.restoreLoading = true;
      restoreCreatureFromFile.call({
        fileId: this.model._id,
      }, error => {
        this.restoreLoading = false;
        if (!error) return;
        console.error(error);
        snackbar({text: error.reason});
      });
    }
  },
}
</script>
