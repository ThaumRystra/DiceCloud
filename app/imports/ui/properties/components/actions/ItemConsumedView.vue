<template lang="html">
  <div
    :class="{
      'theme--dark': theme.isDark,
      'theme--light': !theme.isDark,
    }"
  >
    <v-menu
      v-if="context.creature"
      transition="slide-y-transition"
      lazy
      :disabled="!context.editPermission"
    >
      <template #activator="{ on }">
        <div
          class="layout row align-center justify-start"
          style="height: 100%;"
          :class="{
            'error--text': insufficient,
            'clickable': context.creature && context.editPermission,
            'left-pad': leftPad,
          }"
          v-on="on"
        >
          <svg-icon
            v-if="model.itemIcon"
            class="mr-2"
            :shape="model.itemIcon.shape"
            :color="model.itemColor"
          />
          <div
            class="mr-2 text-no-wrap"
            style="min-width: 24px; text-align: center;"
          >
            <template v-if="model.quantity !== 0 && insufficient">
              {{ model.available }} / {{ model.quantity }}
            </template>
            <template v-else>
              {{ model.available }}
            </template>
          </div>
          <div
            class="text-no-wrap text-truncate flex"
          >
            <template v-if="model.itemId">
              {{ model.itemName }}
            </template>
            <span
              v-else
              class="error--text"
            >
              Select ammo
            </span>
          </div>
          <v-icon v-if="context.editPermission">
            arrow_drop_down
          </v-icon>
        </div>
      </template>
      <select-item-to-consume
        :action="action"
        :item-consumed="model"
      />
    </v-menu>
    <div
      v-else
      class="layout row align-center justify-start"
      :class="{'left-pad': leftPad}"
    >
      <div
        class="mr-2"
        style="width: 24px; text-align: center;"
      >
        {{ model.quantity }}
      </div>
      <div
        class="text-no-wrap text-truncate"
      >
        [{{ model.tag }}]
      </div>
    </div>
  </div>
</template>

<script>
import SelectItemToConsume from '/imports/ui/properties/components/actions/SelectItemToConsume.vue';
export default {
  components: {
    SelectItemToConsume,
  },
  inject: {
    context: {
      default: {},
    },
    theme: {
      default: {
        isDark: false,
      },
    },
  },
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
    action: {
      type: Object,
      required: true,
    },
    leftPad: Boolean,
  },
  computed: {
    insufficient(){
      return this.model.quantity > this.model.available;
    },
  },
}
</script>

<style lang="css" scoped>
.clickable {
  cursor: pointer;
}
.theme--light .clickable:hover {
  background: rgba(0,0,0,.04);
}
.theme--dark .clickable:hover {
  background: hsla(0,0%,100%,.08);
}
.left-pad {
  padding-left: 44px;
}
</style>
