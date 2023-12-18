<template lang="html">
  <div
    :class="{
      'theme--dark': theme.isDark,
      'theme--light': !theme.isDark,
    }"
  >
    <v-menu
      v-if="context.creatureId"
      transition="slide-y-transition"
      :disabled="!context.editPermission"
    >
      <template #activator="{ on }">
        <div
          class="layout align-center justify-start px-2"
          style="height: 100%;"
          :class="{
            'error--text': insufficient,
            'clickable': context.creatureId && context.editPermission,
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
            v-if="quantity !== 1"
            class="mr-2 text-no-wrap"
            style="min-width: 24px; text-align: center;"
          >
            {{ quantity }}
          </div>
          <template v-if="model.itemId">
            <div
              class="text-no-wrap text-truncate"
            >
              {{ model.itemName }}
            </div>
            <div
              v-if="(typeof model.available) == 'number'"
              class="text--disabled text-no-wrap text-truncate ml-1 flex-shrink-0"
            >
              ({{ model.available }})
            </div>
          </template>
          <div
            v-else
            class="error--text text-no-wrap text-truncate flex"
          >
            Select item
          </div>
          <v-icon
            v-if="context.editPermission"
            style="overflow: hidden;"
          >
            mdi-menu-down
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
      class="layout align-center justify-start"
    >
      <div
        class="mr-2"
        style="width: 24px; text-align: center;"
      >
        {{ quantity }}
      </div>
      <div
        class="text-no-wrap text-truncate"
      >
        [{{ model.tag }}]
      </div>
    </div>
  </div>
</template>

<script lang="js">
import SelectItemToConsume from '/imports/client/ui/properties/components/actions/SelectItemToConsume.vue';
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
      return this.quantity > this.model.available;
    },
    quantity(){
      return this.model.quantity && this.model.quantity.value || 0;
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
