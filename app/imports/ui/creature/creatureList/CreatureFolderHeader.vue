<template lang="html">
  <v-list-item style="min-height: 60px;">
    <v-list-item-content>
      <v-list-item-title>
        <template v-if="!renaming">
          {{ model.name }}
        </template>
        <text-field
          v-if="renaming"
          ref="name-input"
          regular
          hide-details
          dense
          :value="model.name"
          @change="renameFolder"
          @click.native.stop=""
          @input.native.stop=""
          @keydown.native.stop=""
          @keyup.native.stop=""
        />
      </v-list-item-title>
    </v-list-item-content>
    <template v-if="!selection && !dense">
      <v-list-item-action v-if="renaming || open">
        <v-btn
          icon
          style="flex-grow: 0"
          @click.stop="renaming = !renaming"
        >
          <v-icon v-if="renaming">
            mdi-check
          </v-icon>
          <v-icon v-else>
            mdi-pencil
          </v-icon>
        </v-btn>
      </v-list-item-action>
      <v-list-item-action v-if="open">
        <v-btn
          icon
          style="flex-grow: 0"
          @click.stop="removeFolder"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script lang="js">
  import Vue from 'vue';
  import updateCreatureFolderName from '/imports/api/creature/creatureFolders/methods.js/updateCreatureFolderName.js';
  import removeCreatureFolder from '/imports/api/creature/creatureFolders/methods.js/removeCreatureFolder.js';
  import {snackbar} from '/imports/ui/components/snackbars/SnackbarQueue.js';

  export default {
    props: {
      model: {
        type: Object,
        required: true,
      },
      open: Boolean,
      selection: Boolean,
      dense: Boolean,
    },
    data(){return {
      renaming: false,
    }},
    watch: {
      renaming(value){
        if (!value) return;
        Vue.nextTick(() => {
          this.$refs['name-input'].focus();
        });
      },
    },
    methods:{
      renameFolder(name, ack){
        updateCreatureFolderName.call({
          _id: this.model._id,
          name
        }, error => {
          ack(error);
          if (!error) return;
          console.error(error);
          snackbar({
            text: error.reason,
          });
        });
      },
      removeFolder(){
        removeCreatureFolder.call({
          _id: this.model._id
        }, error => {
          if (!error) return;
          console.error(error);
          snackbar({
            text: error.reason,
          });
        });
      },
    }
  }
</script>

<style lang="css" scoped>
</style>
