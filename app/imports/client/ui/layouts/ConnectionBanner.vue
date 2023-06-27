<template>
  <v-banner
    v-if="!connected"
    sticky
    single-line
    :icon="icon"
    :color="color"
    style="top: 96px;"
  >
    {{ status }}
  </v-banner>
</template>

<script lang="js">
export default {
  meteor: {
    status() {
      return Meteor.status().status;
    },
    connected() {
      return Meteor.status().connected;
    },
  },
  computed: {
    icon() {
      switch (this.status) {
        case 'connecting': return 'mdi-connection';
        case 'offline': return 'mdi-close-outline';
        case 'waiting': return 'mdi-timer-sand-empty';
        case 'failed': return 'mdi-alert-circle';
        default: return 'mdi-close-outline';
      }
    },
    color() {
      switch (this.status) {
        case 'connecting': return 'warning';
        case 'offline': return 'error';
        case 'waiting': return 'error';
        case 'failed': return 'error';
        default: return 'info';
      }
    },
  }
}
</script>