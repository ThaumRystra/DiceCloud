<template lang="html">
  <div class="tabletop-log">
    <div class="messages layout column justify-end align-end">
      <div
        v-for="message in messages"
        :key="message._id"
        class="message"
      >
        {{ message.content }}
      </div>
    </div>
    <v-textarea
      v-model="messageContent"
      @keyup.enter.prevent="sendMessage"
    />
  </div>
</template>

<script lang="js">
import Messages, { sendMessage } from '/imports/api/tabletop/Messages.js';
export default {
  props: {
    tabletopId: {
      type: String,
      required: true,
    },
  },
  data(){ return {
    messageContent: '',
  }},
  meteor: {
    messages() {
      return Messages.find({
        tabletopId: this.tabletopId,
      }, {
        sort: {
          timeStamp: 1,
        },
      });
    }
  },
  methods: {
    sendMessage(){
      sendMessage.call({
        content: this.messageContent,
        tabletopId: this.tabletopId,
      });
      this.messageContent = '';
    },
  },
}
</script>

<style lang="css" scoped>
</style>
