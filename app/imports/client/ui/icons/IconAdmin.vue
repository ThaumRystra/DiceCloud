<template lang="html">
  <div>
    <div class="content">
      <v-card class="ma-4">
        <v-card-text>
          <v-layout
            column
            align-center
          >
            <upload-btn
              title="Metadata JSON"
              @file-update="metadataFileChanged"
            />
            <upload-btn
              title="Sprite JSON"
              @file-update="fileChanged"
            />
            <icon-picker
              :value="testIcon"
              @change="testIconChange"
            />
          </v-layout>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="js">
  import {importIcons, importIconMetadata} from '/imports/client/ui/icons/importIcons';
  import IconPicker from '/imports/client/ui/components/global/IconPicker.vue';
  import UploadButton from 'vuetify-upload-button';

  export default {
    components: {
      IconPicker,
      UploadBtn: UploadButton,
    },
    data(){ return {
      searchString: '',
      testIcon: undefined,
    }},
    methods: {
      fileChanged (file) {
        importIcons(file);
      },
      metadataFileChanged(file){
        importIconMetadata(file);
      },
      testIconChange(value, ack){
        setTimeout(() => {
          this.testIcon = value;
          ack();
        }, 1000);
      },
    },
  };
</script>

<style lang="css" scoped>
  svg {
    height: 64px;
    width: 64px;
  }
  .v-card {
    height: 100%;
  }
</style>
