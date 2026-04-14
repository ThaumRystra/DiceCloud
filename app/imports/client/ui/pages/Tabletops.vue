<template lang="html">
  <div
    key="tabletops"
    class="card-background tabletops"
    style="height: 100%"
  >
    <v-container>
      <v-fade-transition mode="out-in">
        <v-row
          v-if="!tabletopsReady"
          key="loading-spinner"
        >
          <v-col
            cols="12"
            class="d-flex align-center justify-center"
          >
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            />
          </v-col>
        </v-row>
        <v-row
          v-else-if="tabletops.length"
          key="loaded-cards"
          density="compact"
        >
          <v-col
            v-for="tabletop in tabletops"
            :key="tabletop._id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              class="fill-height d-flex flex-column"
              :data-id="`tabletop-${tabletop._id}`"
              @click="clickTabletop(tabletop._id)"
            >
              <v-img
                v-if="tabletop.imageUrl"
                height="200"
                :src="tabletop.imageUrl"
              />
              <v-card-title>
                {{ tabletop.name || 'Unnamed Tabletop' }}
              </v-card-title>
              <v-card-text v-if="tabletop.description">
                <markdown-text
                  class="line-clamp"
                  :markdown="tabletop.description"
                />
              </v-card-text>
              <v-spacer />
              <v-card-actions>
                <v-spacer />
                <v-btn
                  variant="text"
                  :to="`/tabletop/${tabletop._id}`"
                  @click.stop=""
                  append-icon="mdi-play"
                >
                  Launch
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-row
          v-else
          key="no-tabletops"
        >
          <v-col
            cols="12"
            class="d-flex align-center justify-center"
          >
            <h1>You don't have any tabletops yet</h1>
          </v-col>
        </v-row>
      </v-fade-transition>
    </v-container>
    <v-btn
      color="primary"
      fixed
      bottom
      right
      :loading="addTabletopLoading"
      @click="addTabletop"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { autorun, subscribe } from 'vue-meteor-tracker';
import Tabletops from '/imports/api/tabletop/Tabletops';
import insertTabletop from '/imports/api/tabletop/methods/insertTabletop';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);
const { ready: tabletopsReady } = subscribe('tabletops');
const addTabletopLoading = ref(false);

const { result: tabletops } = autorun(() => Tabletops.find().fetch());

async function addTabletop() {
  addTabletopLoading.value = true;
  try {
    await insertTabletop.callAsync();
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.reason || error.message || error.toString() });
  }
  addTabletopLoading.value = false;
}

function clickTabletop(tabletopId: string) {
  store.commit('pushDialogStack', {
    component: 'tabletop-dialog',
    elementId: `tabletop-${tabletopId}`,
    data: { tabletopId },
  });
}
</script>

<style lang="css" scoped>
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}
</style>
