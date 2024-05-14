<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Sharing
    </v-toolbar-title>
    <div v-if="model">
      <smart-select
        label="Who can view"
        :items="[
          {text: 'Only people I share with', value: 'false'},
          {text: 'Anyone with link', value: 'true'}
        ]"
        :value="!!model.public + ''"
        @change="(value, ack) => setSheetPublic({value, ack})"
      />
      <smart-select
        v-if="docRef.collection === 'libraries'"
        label="Who can copy from this library"
        :items="[
          {text: 'Only people with edit permission', value: 'false'},
          {text: 'Anyone with read permission', value: 'true'}
        ]"
        :value="!!model.readersCanCopy + ''"
        @change="(value, ack) => setReadersCanCopy({value, ack})"
      />
      <text-field
        v-if="model.public && docRef.collection === 'libraries'"
        readonly
        label="Link"
        :value="window.location.origin + $router.resolve({
          name: 'singleLibrary',
          params: { id: model._id },
        }).href"
      />
      <div class="layout">
        <text-field
          label="Username or email"
          :value="userSearched"
          :debounce-time="300"
          @change="(value, ack) => getUser({value, ack})"
        />
        <v-btn
          class="ml-2 mt-2"
          :disabled="userFoundState !== 'found'"
          @click="updateSharing(userId, 'reader')"
        >
          Share
        </v-btn>
      </div>
      <v-list
        two-lines
        class="sharedWith"
      >
        <v-list-item
          v-for="user in sharedUsers"
          :key="user._id"
        >
          <v-list-item-content>
            <v-list-item-title>
              {{ user.username || user._id }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ user.permission === 'writer' ? 'Can edit' : 'Can view' }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-menu
              bottom
              left
              :data-id="'menu-' + user._id"
            >
              <template #activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-if="user.permission === 'reader'"
                  @click="updateSharing(user._id, 'writer')"
                >
                  <v-list-item-action>
                    <v-icon>mdi-pencil</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>Can edit</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-if="user.permission === 'writer'"
                  @click="updateSharing(user._id, 'reader')"
                >
                  <v-list-item-action>
                    <v-icon>mdi-eye</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>View only</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-if="user.permission === 'writer'"
                  @click="makeOwner(user)"
                >
                  <v-list-item-action>
                    <v-icon>mdi-signature</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>Transfer Ownership</v-list-item-title>
                </v-list-item>
                <v-list-item @click="updateSharing(user._id, 'none')">
                  <v-list-item-action>
                    <v-icon>mdi-delete</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>Remove</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-fade-transition>
        <v-progress-circular
          v-if="!$subReady.userPublicProfiles"
          indeterminate
        />
      </v-fade-transition>
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
import {
  setPublic,
  setReadersCanCopy,
  updateUserSharePermissions
} from '/imports/api/sharing/sharing';
import { fetchDocByRef } from '/imports/api/parenting/parentingFunctions';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';

export default {
  components: {
    DialogBase,
  },
  props: {
    docRef: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      userSearched: undefined,
      userFoundState: 'idle',
      userId: undefined,
    }
  },
  methods: {
    setSheetPublic({ value, ack }) {
      setPublic.call({
        docRef: this.docRef,
        isPublic: value === 'true',
      }, (error) => {
        ack(error && error.reason || error);
      });
    },
    setReadersCanCopy({ value, ack }) {
      setReadersCanCopy.call({
        docRef: this.docRef,
        readersCanCopy: value === 'true',
      }, (error) => {
        ack(error && error.reason || error);
      });
    },
    getUser({ value, ack }) {
      this.userSearched = value;
      if (!value) {
        this.userFoundState = 'idle';
        ack();
        return;
      }
      Meteor.users.findUserByUsernameOrEmail.call({
        usernameOrEmail: value
      }, (error, result) => {
        if (error) {
          ack(error && error.reason || error);
          this.userFoundState = 'failed';
        } else {
          this.userId = result;
          if (result) {
            if (result === this.model.owner) {
              this.userFoundState = 'failed';
              ack('User is already the owner')
            } else {
              this.userFoundState = 'found';
              ack();
            }
          } else {
            this.userFoundState = 'notFound';
            ack('User not found');
          }
        }
      });
    },
    updateSharing(userId, role) {
      updateUserSharePermissions.call({
        docRef: this.docRef,
        userId,
        role,
      });
    },
    makeOwner(user) {
      this.$store.commit('pushDialogStack', {
        component: 'transfer-ownership-dialog',
        elementId: 'menu-' + user._id,
        data: {
          docRef: this.docRef,
          user,
        },
      });
    },
  },
  meteor: {
    model() {
      if (!this.docRef || !this.docRef.id) return;
      let model = fetchDocByRef(this.docRef);
      return model;
    },
    sharedUsers() {
      let users = [];
      Meteor.users.find({ _id: { $in: this.model.readers } }).forEach(user => {
        user.permission = 'reader';
        users.push(user);
      });
      Meteor.users.find({ _id: { $in: this.model.writers } }).forEach(user => {
        user.permission = 'writer';
        users.push(user);
      });
      users.sort(function (a, b) {
        if (a.username < b.username) return -1;
        if (a.username > b.username) return 1;
        return 0;
      });
      return users;
    },
    $subscribe: {
      'userPublicProfiles'() {
        let model = this.model;
        if (!model) return false;
        return [[model.owner, ...model.writers, ...model.readers]];
      },
    },
  },
}
</script>

<style lang="css" scoped>

</style>
