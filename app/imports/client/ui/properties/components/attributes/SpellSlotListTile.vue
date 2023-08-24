<template lang="html">
  <v-list-item
    :key="model._id"
    class="spell-slot-list-tile"
    v-bind="$attrs"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-item-content>
      <v-list-item-title v-if="Number.isFinite(model.total)">
        <div
          v-if="model.total <= 0 || model.total > 5 || model.value > model.total || model.value < 0"
          class="layout value"
          style="align-items: baseline;"
        >
          <div
            style="font-weight: 500; font-size: 24px"
            class="current-value"
          >
            {{ model.value }}
          </div>
          <div
            v-if="model.total"
            class="ml-2 max-value"
          >
            /{{ model.total }}
          </div>
        </div>
        <div
          v-else
          class="layout align-center slot-bubbles"
        >
          <smart-btn
            v-for="i in model.total"
            :key="i"
            :disabled="disabled(i)"
            icon
            single-click
            @click="ack => damageProperty({
              type: 'increment',
              value: i <= model.value ? 1 : -1,
              ack
            })"
          >
            <v-icon>
              {{
                i > model.value ?
                  'mdi-radiobox-blank' :
                  'mdi-radiobox-marked'
              }}
            </v-icon>
          </smart-btn>
        </div>
      </v-list-item-title>
      <v-list-item-title v-else>
        <code>
          {{ model.total }}
        </code>
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ model.name }}
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
import damageProperty from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
import numberToSignedString from '/imports/api/utility/numberToSignedString.js';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';

export default {
  inject: {
    context: { default: {} }
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    dark: Boolean,
  },
  computed: {
    hasClickListener() {
      return this.$listeners && !!this.$listeners.click;
    },
  },
  methods: {
    signed: numberToSignedString,
    click(e) {
      this.$emit('click', e);
    },
    disabled(i) {
      if (!this.context.editPermission) return true;
      // Use these if only the next filled or empty slot can be clicked
      // if (this.model.value ===  i) return false;
      // if (this.model.value === i - 1) return false;
      // return true
      return false;
    },
    damageProperty({type, value, ack}) {
      damageProperty.call({
        _id: this.model._id,
        operation: type,
        value: value
      }, error => {
        if (ack) ack(error);
        if (error) {
          snackbar({ text: error.reason || error.message || error.toString() });
          console.error(error);
        }
      });
    },
  },
};
</script>

<style lang="css" scoped>
.spell-slot-list-tile {
  background: inherit;
}

.v-list__tile__action {
  width: 112px;
  flex-shrink: 0;
}

.spell-slot-list-tile.hover {
  background: #f5f5f5 !important;
}

.theme--dark .spell-slot-list-tile.hover {
  background: #515151 !important;
}

.content {
  cursor: pointer;
}

.max-value {
  color: rgba(0, 0, 0, .54);
}

.theme--dark .max-value {
  color: rgba(255, 255, 255, 0.54);
}
</style>
