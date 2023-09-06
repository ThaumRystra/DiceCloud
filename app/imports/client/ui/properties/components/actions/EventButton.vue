<template lang="html">
  <v-btn
    :loading="doActionLoading"
    :disabled="context.editPermission === false"
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
import doAction from '/imports/api/engine/actions/doAction.js';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';

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
    activated: undefined,
    doActionLoading: false,
    hovering: false,
  }},
  methods: {
    click(e) {
      this.$emit('click', e);
    },
    doAction({ advantage }) {
      this.doActionLoading = true;
      this.shwing();
      doAction.call({
        actionId: this.model._id,
        scope: {
          '~attackAdvantage': { value: advantage },
        }
      }, error => {
        this.doActionLoading = false;
        if (error) {
          console.error(error);
          snackbar({ text: error.reason });
        }
      });
    },
    shwing() {
      this.activated = true;
      setTimeout(() => {
        this.activated = undefined;
      }, 150);
    }
  }
}
</script>

<style lang="css">
.event-button .v-btn__content {
  max-width: 100%;
}
</style>
