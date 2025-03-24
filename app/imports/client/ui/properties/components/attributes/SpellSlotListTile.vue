<template lang="html">
  <v-list-item
    :key="model._id"
    :data-id="`spell-slot-list-tile-${model._id}`"
    :disabled="disabled"
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
          v-else-if="canEdit"
          class="layout align-center slot-bubbles"
        >
          <smart-btn
            v-for="i in model.total"
            :key="i"
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
        <div
          v-else
          class="layout align-center slot-bubbles view-only"
          :class="{'disabled-icon': disabled}"
        >
          <v-icon
            v-for="i in model.total"
            :key="i"
            class="ma-1"
          >
            {{
              i > model.value ?
                'mdi-radiobox-blank' :
                'mdi-radiobox-marked'
            }}
          </v-icon>
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
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import doAction from '/imports/client/ui/creature/actions/doAction';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';

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
    viewOnly: Boolean,
    disabled: Boolean,
  },
  computed: {
    hasClickListener() {
      return this.$listeners && !!this.$listeners.click;
    },
    canEdit() {
      return this.context.editPermission && !this.viewOnly;
    },
  },
  methods: {
    signed: numberToSignedString,
    click(e) {
      this.$emit('click', e);
    },
    damageProperty({ type, value, ack }) {
      const model = this.model;
      doAction({
        creatureId: model.root.id,
        $store: this.$store,
        elementId: `spell-slot-list-tile-${model._id}`,
        task: {
        subtaskFn: 'damageProp',
        prop: model,
        targetIds: [model.root.id],
        params: {
          title: getPropertyTitle(model),
          operation: type,
          value,
          targetProp: model,
        }
      }}).then(() =>{
        ack?.();
      }).catch((error) => {
        if (ack) {
          ack(error);
        } else  {
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

.disabled-icon {
  opacity: 0.3;
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
