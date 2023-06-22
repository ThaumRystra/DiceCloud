<template>
  <v-list-item
    @click="$emit('click')"
  >
    <v-list-item-content>
      <v-list-item-title>
        {{ model.name }}
      </v-list-item-title>
    </v-list-item-content>
    <v-list-item-action v-if="!model.hideRemoveButton">
      <v-btn
        icon
        @click.stop="$emit('remove', model.id)"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="js">
export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
}
</script>