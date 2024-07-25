<template lang="html">
  <dialog-base
    v-if="model"
    :color="model.color"
  >
    <template slot="toolbar">
      <v-tabs
        v-model="tab"
        grow
      >
        <v-tab>User Files</v-tab>
        <v-tab>From URL</v-tab>
      </v-tabs>
    </template>
    <div>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <user-images-list v-model="url" />
        </v-tab-item>
        <v-tab-item>
          <v-card>
            <v-card-text>
              <v-text-field
                v-model="url"
                label="URL"
              />
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </div>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      @click="$store.dispatch('popDialogStack')"
    >
      Done
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';

export default {
  components: {
    DialogBase,
  },
  props: {
  },
  data() {
    return {
      tab: 0,
      file: undefined,
      progress: 0,
      url: '',
    };
  },
};
</script>

<style lang="css" scoped>

</style>
