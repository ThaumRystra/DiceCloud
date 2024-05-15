<template lang="html">
  <v-list-item-content :style="dense ? undefined : 'min-height: 60px;'">
    <v-list-item-title class="d-flex align-center">
      <div
        v-if="!renaming"
        class="text-truncate text-no-wrap"
      >
        {{ model.name }}
      </div>
      <text-field
        v-if="renaming"
        ref="name-input"
        regular
        hide-details
        dense
        :value="newName"
        @change="renameFolder"
        @click.native.stop=""
        @input.native.stop=""
        @keydown.native.stop=""
        @keyup.native.stop=""
      />
      <template v-if="!selection && !dense">
        <v-spacer />
        <v-btn
          v-if="renaming || open"
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
        <v-btn
          v-if="open"
          icon
          style="flex-grow: 0"
          @click.stop="removeFolder"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-list-item-title>
  </v-list-item-content>
</template>

<script lang="js">
  import Vue from 'vue';
  import updateCreatureFolderName from '/imports/api/creature/creatureFolders/methods.js/updateCreatureFolderName';
  import removeCreatureFolder from '/imports/api/creature/creatureFolders/methods.js/removeCreatureFolder';
  import {snackbar} from '/imports/client/ui/components/snackbars/SnackbarQueue';

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
      newName: this.model?.name,
    }},
    watch: {
      renaming(value){
        if (value) {
          Vue.nextTick(() => {
            this.$refs['name-input'].focus();
          });
        } else if (this.newName && this.newName !== this.model.name) {
          updateCreatureFolderName.call({
            _id: this.model._id,
            name: this.newName
          }, error => {
            if (!error) return;
            console.error(error);
            snackbar({
              text: error.reason,
            });
          });
        }
      },
    },
    methods:{
      renameFolder(name, ack){
        this.newName = name;
        ack();
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
