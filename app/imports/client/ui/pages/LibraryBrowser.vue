<template>
  <div
    class="card-background"
    style="height: 100%"
  >
    <v-container>
      <v-fade-transition mode="out-in">
        <v-row
          v-if="browseReady"
          key="loaded-cards"
          density="compact"
        >
          <v-col
            v-for="card in libraryCards"
            :key="card._id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-sheet
              class="fill-height"
              rounded
              border
              :color="card.subscribed ? 'accent': ''"
            >
              <v-card
                class="fill-height d-flex flex-column"
                elevation="0"
                :to="`/library${card._type === 'libraryCollection' ? '-collection' : ''}/${card._id}`"
              >
                <v-card-title>
                  {{ card.name }}
                </v-card-title>
                <v-card-subtitle v-if="card.subscriberCount">
                  {{ formatNumber(card.subscriberCount) }} subscribers
                </v-card-subtitle>
                <v-card-text>
                  <markdown-text :markdown="card.description" />
                </v-card-text>
                <v-spacer />
                <v-card-actions>
                  <v-spacer />
                  <smart-btn
                    variant="text"
                    single-click
                    :color="card.subscribed ? '': 'accent'"
                    @click="ack => changeSubscribe(card, ack)"
                  >
                    {{ card.subscribed ? 'Unsubscribe' : 'Subscribe' }}
                  </smart-btn>
                </v-card-actions>
              </v-card>
            </v-sheet>
          </v-col>
        </v-row>
        <v-row
          v-else
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
      </v-fade-transition>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { orderBy } from 'lodash';
import LibraryCollections from '/imports/api/library/LibraryCollections';
import Libraries from '/imports/api/library/Libraries';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import formatter from '/imports/client/ui/utility/numberFormatter';

const { ready: browseReady } = subscribe('browseLibraries');

const { result: collections } = autorun(() => {
  const user = (Meteor.user() as any) || {};
  const subCollections = user.subscribedLibraryCollections || [];
  return LibraryCollections.find({
    showInMarket: true,
    public: true,
  }, {
    sort: { subscriberCount: 1, name: 1 }
  }).map((col: any) => {
    col.subscribed = subCollections.includes(col._id);
    col._type = 'libraryCollection';
    return col;
  });
});

const { result: libraries } = autorun(() => {
  const user = (Meteor.user() as any) || {};
  const subLibraries = user.subscribedLibraries || [];
  return Libraries.find({
    showInMarket: true,
    public: true,
  }, {
    sort: { subscriberCount: 1, name: 1 }
  }).map((lib: any) => {
    lib.subscribed = subLibraries.includes(lib._id);
    lib._type = 'library';
    return lib;
  });
});

const libraryCards = computed(() =>
  orderBy(
    [...(libraries.value ?? []), ...(collections.value ?? [])],
    ['subscriberCount', 'name'],
    ['desc', 'asc']
  )
);

function formatNumber(num: number) {
  return formatter.format(num);
}

async function changeSubscribe(card: any, ack: (err?: string) => void) {
  const id = card._id;
  const sub = !card.subscribed;
  try {
    if (card._type === 'library') {
      await (Meteor.users as any).subscribeToLibrary.callAsync({
        libraryId: id,
        subscribe: sub,
      });
    } else if (card._type === 'libraryCollection') {
      await (Meteor.users as any).subscribeToLibraryCollection.callAsync({
        libraryCollectionId: id,
        subscribe: sub,
      });
    } else {
      ack('Library or Library Collection not found');
      return;
    }
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
}
</script>
