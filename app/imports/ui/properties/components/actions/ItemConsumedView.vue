<template lang="html">
  <div
    :class="{
      'theme--dark': theme.isDark,
      'theme--light': !theme.isDark,
    }"
  >
    <v-menu
      transition="slide-y-transition"
      lazy
    >
      <template #activator="{ on }">
        <div
          class="layout row align-center justify-start"
          style="height: 100%;"
          :class="{
            'error--text': insufficient,
            'clickable': context.editPermission,
          }"
          v-on="on"
        >
          <div
            class="mr-2"
            style="width: 24px; text-align: center;"
          >
            <template v-if="model.quantity === 1">
              {{ model.available }}
            </template>
            <template v-else-if="model.quantity !== 0">
              {{ model.available }} / {{ model.quantity }}
            </template>
          </div>
          <svg-icon
            v-if="model.itemIcon"
            :shape="model.itemIcon.shape"
            :color="model.itemColor"
          />
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
</style>
