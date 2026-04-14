<script setup lang="ts">
import { ref } from 'vue';
import { importIcons, importIconMetadata } from '/imports/client/ui/icons/importIcons';
import IconPicker from '/imports/client/ui/components/global/IconPicker.vue';
import UploadButton from '/imports/client/ui/components/UploadBtn.vue';

const searchString = ref('');
const testIcon = ref<string | undefined>(undefined);

function fileChanged(file: File) {
  importIcons(file);
}

function metadataFileChanged(file: File) {
  importIconMetadata(file);
}

function testIconChange(value: string, ack: Function) {
  setTimeout(() => {
    testIcon.value = value;
    ack();
  }, 1000);
}
</script>

<template lang="html">
  <div>
    <div class="content">
      <v-card class="ma-4">
        <v-card-text>
          <div class="d-flex flex-column align-center">
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
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style lang="css" scoped>
  svg {
    height: 64px;
    width: 64px;
  }
  .v-card {
    height: 100%;
  }
</style>
