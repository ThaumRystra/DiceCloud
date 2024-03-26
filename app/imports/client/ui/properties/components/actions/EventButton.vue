<template lang="html">
  <v-btn
    :disabled="context.editPermission === false"
    :data-id="`event-btn-${model._id}`"
    outlined
    class="event-button"
    style="min-width: 160px; max-width: 100%;"
    :color="model.color"
    @click="doAction"
  >
    <property-icon
      style="margin-left: -4px; margin-right: 8px;"
      :model="model"
    />
    <div
      class="text-truncate"
    >
      {{ model.name }}
    </div>
  </v-btn>
</template>

<script lang="js">
import doAction from '/imports/client/ui/creature/actions/doAction';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';

export default {
  components: {
    PropertyIcon,
  },
  inject: {
    context: { default: {} }
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data(){return {
    hovering: false,
  }},
  methods: {
    doAction() {
      doAction(this.model, this.$store, `event-btn-${this.model._id}`);
    },
  }
}
</script>

<style lang="css">
.event-button .v-btn__content {
  max-width: 100%;
}
</style>
