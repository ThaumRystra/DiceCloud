<template lang="html">
  <v-list-item
    class="item"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-item-avatar class="item-avatar">
      <property-icon
        class="mr-2"
        :model="model"
        :color="model.color"
      />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ title }}
      </v-list-item-title>
    </v-list-item-content>
    <v-list-item-action
      v-if="model.attuned"
      style="min-width: 40px;"
    >
      <v-icon>$vuetify.icons.spell</v-icon>
    </v-list-item-action>
    <v-list-item-action style="min-width: 40px;">
      <increment-button
        v-if="context.creatureId && model.showIncrement"
        icon
        color="primary"
        :disabled="context.editPermission === false"
        :value="model.quantity"
        :loading="incrementLoading"
        @change="changeQuantity"
      />
    </v-list-item-action>
    <v-list-item-action class="drag-handle">
      <drag-handle 
        :disabled="context.editPermission === false"
        style="height: 100%; width: 40px; cursor: move;"
      />
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="js">
import PROPERTIES from '/imports/constants/PROPERTIES';
import adjustQuantity from '/imports/api/creature/creatureProperties/methods/adjustQuantity';
import IncrementButton from '/imports/client/ui/components/IncrementButton.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

export default {
  components: {
    IncrementButton,
    PropertyIcon,
  },
  inject: {
    context: { default: {} }
  },
  props: {
    itemId: {
      type: String,
      required: true,
    },
    selected: Boolean,
    hideIcon: Boolean,
    preparingSpells: Boolean,
  },
  data() {
    return {
      incrementLoading: false,
    }
  },
  computed: {
    hasClickListener() {
      return this.$listeners && !!this.$listeners.click;
    },
    title() {
      let model = this.model;
      if (!model) return;
      if (model.quantity !== 1) {
        if (model.plural) {
          return `${model.quantity} ${model.plural}`;
        } else if (model.name) {
          return `${model.quantity} ${model.name}`;
        }
      } else if (model.name) {
        return model.name;
      }
      let prop = PROPERTIES[model.type]
      return prop && prop.name;
    }
  },
  methods: {
    click(e) {
      this.$emit('click', e);
    },
    changeQuantity({ type, value }) {
      this.incrementLoading = true;
      adjustQuantity.call({
        _id: this.model._id,
        operation: type,
        value: value
      }, error => {
        this.incrementLoading = false;
        if (error) {
          snackbar({ text: error.reason });
          console.error(error);
        }
      });
    }
  },
  meteor: {
    model() {
      return CreatureProperties.findOne(this.itemId);
    }
  }
}
</script>

<style lang="css" scoped>
.item-avatar {
  min-width: 32px;
}

.item {
  background-color: inherit;
}
</style>
