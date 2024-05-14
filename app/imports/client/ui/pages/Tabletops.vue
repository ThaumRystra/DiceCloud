<template lang="html">
  <div
    key="tabletops"
    class="card-background tabletops"
    style="height: 100%"
  >
    <v-container>
      <v-fade-transition mode="out-in">
        <v-row
          v-if="!$subReady.tabletops"
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
          dense
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
                  text
                  :to="`/tabletop/${tabletop._id}`"
                  @click.native.stop=""
                >
                  Launch
                  <v-icon right>
                    mdi-play
                  </v-icon> 
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
      fab
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

<script lang="js">
import Tabletops from '/imports/api/tabletop/Tabletops';
import insertTabletop from '/imports/api/tabletop/methods/insertTabletop';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';

export default {
  components: {
    MarkdownText,
  },
  data(){return {
    addTabletopLoading: false,
  }},
  meteor: {
    tabletops(){
      return Tabletops.find();
    },
    $subscribe: {
      'tabletops': [],
    },
  },
  methods: {
    addTabletop(){
      this.addTabletopLoading = true;
      insertTabletop.call(error => {
        if (error) {
          console.error(error)
          snackbar({ text: error.reason || error.message || error.toString() });
        }
        this.addTabletopLoading = false;
      });
    },
    clickTabletop(tabletopId) {
      this.$store.commit('pushDialogStack', {
        component: 'tabletop-dialog',
        elementId: `tabletop-${tabletopId}`,
        data: {
          tabletopId,
        },
      });
    },
  }
}
</script>

<style lang="css" scoped>
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;  
}
</style>
