<template lang="html">
  <dialog-base v-if="model">
    <template #toolbar>
      <v-toolbar-title>
        {{ model.name || 'Unnamed Tabletop' }}
      </v-toolbar-title>
      <v-spacer />
      <v-slide-x-transition>
        <v-btn
          v-if="editing"
          icon
          :disabled="editPermission === false"
          data-id="remove-btn"
          @click="removeTabletop"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-slide-x-transition>
      <v-btn
        tile
        outlined
        @click="toggleEditing"
      >
        <span style="width: 44px;">
          {{ editing ? 'Done' : 'Edit' }}
        </span>
        <v-slide-y-transition
          hide-on-leave
        >
          <v-icon
            v-if="editing"
            key="doneIcon"
            right
          >
            mdi-check
          </v-icon>
          <v-icon
            v-else
            key="createIcon"
            right
          >
            mdi-pencil
          </v-icon>
        </v-slide-y-transition>
      </v-btn>
    </template>
    <v-fade-transition
      mode="out-in"
    >
      <tabletop-form
        v-if="editing"
        key="tabletop-form"
        :model="model"
        :edit-permission="editPermission"
        :users="users"
        @change="changeEvent"
        @update-sharing="updateSharingEvent"
      />
      <tabletop-viewer
        v-else
        key="tabletop-viewer"
        :model="model"
        :users="users"
      />
    </v-fade-transition>
    <template #actions>
      <div
        class="layout"
      >
        <v-btn
          text
          @click="$store.dispatch('popDialogStack')"
        >
          Close
        </v-btn>
        <v-spacer />
        <v-btn
          color="accent"
          :to="`/tabletop/${model._id}`"
          @click="$store.dispatch('popDialogStack')"
        >
          Launch
          <v-icon
            right
            dark
          >
            mdi-play
          </v-icon>
        </v-btn>
      </div>
    </template>
  </dialog-base>
</template>

<script lang="js">
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import TabletopForm from '/imports/client/ui/tabletop/TabletopForm.vue';
import Tabletops from '/imports/api/tabletop/Tabletops';
import TabletopViewer from '/imports/client/ui/tabletop/TabletopViewer.vue';
import { assertCanEditTabletop } from '/imports/api/tabletop/methods/shared/tabletopPermissions';
import updateTabletop from '/imports/api/tabletop/methods/updateTabletop';
import removeTabletop from '/imports/api/tabletop/methods/removeTabletop';
import updateTabletopSharing from '/imports/api/tabletop/methods/updateTabletopSharing';

export default {
  components: {
    DialogBase,
    TabletopForm,
    TabletopViewer,
  },
  props: {
    tabletopId: {
      type: String,
      required: true,
    },
    startInEditTab: {
      type: Boolean,
      default: false,
    },
  },
  data(){ return {
    editing: !!this.startInEditTab,
  }},
  meteor: {
    $subscribe: {
      'tabletopUsers'() {
        return [this.tabletopId];
      },
    },
    model(){
      return Tabletops.findOne(this.tabletopId);
    },
    editPermission(){
      const userId = Meteor.userId();
      if (!userId) return false;
      try {
        assertCanEditTabletop(this.model, userId);
        return true;
      } catch (e) {
        return false;
      }
    },
    users() {
      return {
        owner: Meteor.users.findOne(this.model.owner),
        gameMasters: Meteor.users.find({
          _id: { $in: this.model.gameMasters }
        }).fetch(),
        players: Meteor.users.find({
          _id: { $in: this.model.players }
        }).fetch(),
        spectators: Meteor.users.find({
          _id: { $in: this.model.spectators }
        }).fetch(),
      }
    },
  },
  methods: {
    notImplemented() {
      snackbar({text: 'Not implemented'});
    },
    toggleEditing() {
      this.editing = !this.editing;
    },
    changeEvent({ path, value, ack }) {
      if (typeof path === 'string') {
        path = path.split('.');
      }
      updateTabletop.call({
        _id: this.tabletopId,
        path,
        value,
      }, (error) => {
        ack(error);
      });
    },
    updateSharingEvent({ userId, role, ack }) {
      updateTabletopSharing.call({
        tabletopId: this.tabletopId,
        userId,
        role
      }, error => {
        ack?.(error);
      });
    },
    removeTabletop() {
      const router = this.$router;
      const tabletopId = this.tabletopId;
      const store = this.$store;
      this.$store.commit('pushDialogStack', {
        component: 'delete-confirmation-dialog',
        elementId: 'remove-btn',
        data: {
          name: this.model.name,
          typeName: 'Tabletop'
        },
        callback(confirmation) {
          if (!confirmation) return;
          store.dispatch('popDialogStack');
          removeTabletop.call({ tabletopId }, (error) => {
            if (error) {
              snackbar({ text: error.reason || error.message || error.toString() });
              console.error(error);
            }
          });
          //Navigate back to tabletops page if we aren't there already
          if (router.currentRoute.path !== '/tabletops') {
            router.push('/tabletops');
          }
        }
      });
    }
  }
};
</script>

