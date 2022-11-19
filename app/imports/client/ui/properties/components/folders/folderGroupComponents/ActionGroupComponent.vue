<template>
  <div
    v-if="model.actionType === 'event'"
    class="d-flex justify-center"
  >
    <event-button
      class="ma-1"
      :model="model"
    />
  </div>
  <action-card
    v-else
    :model="model"
    @click="$emit('click')"
    @sub-click="_id => $emit('sub-click', _id)"
  />
</template>

<script lang="js">
import ActionCard from '/imports/client/ui/properties/components/actions/ActionCard.vue';
import EventButton from '/imports/client/ui/properties/components/actions/EventButton.vue';

export default {
  components: {
    ActionCard,
    EventButton,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
}
</script>