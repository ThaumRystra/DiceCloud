<template>
  <div
    class="card-background"
    style="height: 100%"
  >
    <v-container>
      <v-fade-transition mode="out-in">
        <v-row
          v-if="$subReady.browseLibraries"
          key="loaded-cards"
          dense
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
              outlined
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
                    text
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

<script lang="js">
import { orderBy } from 'lodash';
import LibraryCollections from '/imports/api/library/LibraryCollections';
import Libraries from '/imports/api/library/Libraries';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import formatter from '/imports/client/ui/utility/numberFormatter';

export default {
  components: {
    MarkdownText
  },
  data(){ return{
    loadingInsertLibraryCollection: false,
    openCollections: [],
  }},
  meteor: {
    $subscribe: {
      'browseLibraries': [],
    },
    collections(){
      const user = Meteor.user() || {};
      const subCollections = user.subscribedLibraryCollections || [];
      return LibraryCollections.find({
        showInMarket: true,
        public: true,
      }, {
        sort: { subscriberCount: 1, name: 1 }
      }).map(col => {
        col.subscribed = subCollections.includes(col._id);
        col._type = 'libraryCollection';
        return col;
      });
    },
    libraries(){
      const user = Meteor.user() || {};
      const subLibraries = user.subscribedLibraries || [];
      return Libraries.find({
        showInMarket: true,
        public: true,
      }, {
        sort: { subscriberCount: 1, name: 1 }
      }).map(lib => {
        lib.subscribed = subLibraries.includes(lib._id);
        lib._type = 'library';
        return lib;
      });
    },
    libraryCards() {
      return orderBy([...this.libraries, ...this.collections], ['subscriberCount', 'name'], ['desc', 'asc']);
    },
  },
  methods: {
    formatNumber(num) {
      return formatter.format(num);
    },
    changeSubscribe(card, ack) {
      const id = card._id;
      const subscribe = !card.subscribed;

      if (card._type === 'library') {
        Meteor.users.subscribeToLibrary.call({
          libraryId: id,
          subscribe,
        }, ack);
      } else if (card._type === 'libraryCollection') {
        Meteor.users.subscribeToLibraryCollection.call({
          libraryCollectionId: id,
          subscribe,
        }, ack);
      } else {
        ack('Library or Library Collection not found')
      }
    },
  },
};
</script>
