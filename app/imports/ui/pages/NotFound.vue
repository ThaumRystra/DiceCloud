<template>
  <toolbar-layout>
    <div slot="toolbar">
      Not Found
    </div>
    <v-layout
      align-center
      justify-center
    >
      <h1>
        No page was found for this address
      </h1>
    </v-layout>
  </toolbar-layout>
</template>

<script>
import ToolbarLayout from '/imports/ui/layouts/ToolbarLayout.vue';
  export default {
    components: {
      ToolbarLayout,
    }
  }
</script>
