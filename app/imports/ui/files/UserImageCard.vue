<template>
  <v-card
    :data-id="`${model._id}-archive-card`"
    tile
  >
    <v-img
      :src="model.link"
      :aspect-ratio="1.4"
      class="white--text align-end"
    >
      <v-card-title>
        {{ model.name }}
      </v-card-title>
      <v-card-subtitle>
        {{ model.size }}
      </v-card-subtitle>
    </v-img>
    <v-card-actions>
      <v-flex />
      <v-btn
        icon
        @click="remove"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-btn
        icon
        :href="`${model.link}?download=true`"
      >
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="js">

export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      restoreLoading: false,
      removeLoading: false,
    }
  },
  methods: {
    remove() {

    },
  },
}
</script>
