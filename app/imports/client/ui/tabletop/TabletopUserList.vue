<template lang="html">
  <v-list
    two-lines
    class="sharedWith"
  >
    <v-slide-x-transition
      group
      leave-absolute
    >
      <v-list-item
        v-for="user in users"
        :key="user._id"
      >
        <v-list-item-content>
          <v-list-item-title>
            {{ user.username || user._id }}
          </v-list-item-title>
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
                v-if="role !== 'gameMaster'"
                :disabled="!editPermission"
                @click="$emit('set-role', {userId: user._id, role: 'gameMaster'})"
              >
                <v-list-item-action>
                  <v-icon>mdi-pencil</v-icon>
                </v-list-item-action>
                <v-list-item-title>Make game master</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="role !== 'player'"
                :disabled="!editPermission"
                @click="$emit('set-role', {userId: user._id, role: 'player'})"
              >
                <v-list-item-action>
                  <v-icon>mdi-account-box</v-icon>
                </v-list-item-action>
                <v-list-item-title>Make player</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="role !== 'spectator'"
                :disabled="!editPermission"
                @click="$emit('set-role', {userId: user._id, role: 'spectator'})"
              >
                <v-list-item-action>
                  <v-icon>mdi-eye</v-icon>
                </v-list-item-action>
                <v-list-item-title>Make spectator</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="role === 'gameMaster' && user._id !== owner"
                :disabled="!editPermission"
                @click="$emit('set-role', {userId: user._id, role: 'owner'})"
              >
                <v-list-item-action>
                  <v-icon>mdi-signature</v-icon>
                </v-list-item-action>
                <v-list-item-title>Transfer Ownership</v-list-item-title>
              </v-list-item>

              <v-list-item
                :disabled="!editPermission || user._id === currentUserId"
                @click="$emit('set-role', {userId: user._id, role: 'none'})"
              >
                <v-list-item-action>
                  <v-icon>mdi-delete</v-icon>
                </v-list-item-action>
                <v-list-item-title>Remove</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item-action>
      </v-list-item>
    </v-slide-x-transition>
  </v-list>
</template>

<script lang="js">
export default {
  name: 'TabletopUserList',
  props: {
    users: {
      type: Array,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    editPermission: {
      type: Boolean,
      required: true,
    },
  },
  meteor: {
    currentUserId() {
      return Meteor.userId();
    }
  }
}
</script>