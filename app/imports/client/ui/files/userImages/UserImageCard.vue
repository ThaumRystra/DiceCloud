<template>
  <v-card
    class="user-image-card d-flex flex-column"
    @click="previewImage"
  >
    <v-img
      :lazy-src="thumbHashDataUrl"
      :src="model.link"
      :data-id="`${model._id}-image`"
    />
    <div class="flex" />
    <v-card-title class="no-wrap">
      {{ model.name }}
    </v-card-title>
    <v-card-subtitle class="no-wrap">
      {{ model.size }}
    </v-card-subtitle>
    <v-card-actions>
      <div class="flex" />
      <v-menu location="start">
        <template #activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="removeUserFile">
            <v-list-item-title>
              Delete file
              <v-icon class="ml-1">
                mdi-delete
              </v-icon>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        icon
        :href="`${model.link}?download=true`"
        @click.stop
      >
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import removeUserImage from '/imports/api/files/userImages/methods/removeUserImage';
import { thumbHashToDataURL } from 'thumbhash';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  model: any;
}>();

const store = useStore(key);
const removeLoading = ref(false);

const thumbHashDataUrl = computed(() => {
  const thumbHash = props.model.meta?.thumbHash;
  if (!thumbHash) return;
  return thumbHashToDataURL(thumbHash);
});

async function removeUserFile() {
  removeLoading.value = true;
  try {
    await removeUserImage.callAsync({ fileId: props.model._id });
  } catch (error: any) {
    snackbar({ text: error.reason || error.message || error.toString() });
    console.error(error);
  }
  removeLoading.value = false;
}

function previewImage() {
  store.commit('pushDialogStack', {
    component: 'image-preview-dialog',
    elementId: `${props.model._id}-image`,
    data: {
      href: props.model.link,
    },
  });
}
</script>

<style scoped>
.no-wrap {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-image-card {
  height: 100%;
}
</style>
