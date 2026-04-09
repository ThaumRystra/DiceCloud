<template lang="html">
  <v-list
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
        <v-list-item-title>
          {{ user.username || user._id }}
        </v-list-item-title>
        <template #append>
          <v-menu
            bottom
            left
            :data-id="'menu-' + user._id"
          >
            <template #activator="{ props }">
              <v-btn
                icon
                v-bind="props"
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
                <template #prepend>
                  <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>Make game master</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="role !== 'player'"
                :disabled="!editPermission"
                @click="$emit('set-role', {userId: user._id, role: 'player'})"
              >
                <template #prepend>
                  <v-icon>mdi-account-box</v-icon>
                </template>
                <v-list-item-title>Make player</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="role !== 'spectator'"
                :disabled="!editPermission"
                @click="$emit('set-role', {userId: user._id, role: 'spectator'})"
              >
                <template #prepend>
                  <v-icon>mdi-eye</v-icon>
                </template>
                <v-list-item-title>Make spectator</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="role === 'gameMaster' && user._id !== owner"
                :disabled="!editPermission"
                @click="$emit('set-role', {userId: user._id, role: 'owner'})"
              >
                <template #prepend>
                  <v-icon>mdi-signature</v-icon>
                </template>
                <v-list-item-title>Transfer Ownership</v-list-item-title>
              </v-list-item>

              <v-list-item
                :disabled="!editPermission || user._id === currentUserId"
                @click="$emit('set-role', {userId: user._id, role: 'none'})"
              >
                <template #prepend>
                  <v-icon>mdi-delete</v-icon>
                </template>
                <v-list-item-title>Remove</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-list-item>
    </v-slide-x-transition>
  </v-list>
</template>

<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';

defineProps<{
  users: any[];
  owner: string;
  role: string;
  editPermission: boolean;
}>();

const { result: currentUserId } = autorun(() => Meteor.userId());
</script>
