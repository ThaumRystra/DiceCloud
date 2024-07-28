<template lang="html">
  <v-col
    class="mb-3"
    v-bind="cols"
  >
    <fieldset
      :class="theme.isDark? 'theme--dark' :'theme--light'"
      class="d-flex rounded v-sheet--outlined pt-4 layout column align-center justify-center fill-height"
      style="overflow: hidden"
      @click="$emit('click', $event)"
    >
      <legend
        v-if="name"
        class="text-caption px-1 name"
        style="line-height: 0;"
      >
        {{ name }}
      </legend>
 
      <img 
        :src="href"
        class="image"
        :data-id="`image-${href}`"
        @click="previewImage"
      >
    </fieldset>
  </v-col>
</template>

<script lang="js">
export default {
 inject: {
   theme: {
     default: {
       isDark: false,
     },
   },
 },
 props: {
    name: {
      type: String,
      default: undefined,
    },
    href: {
      type: String,
      default: undefined,
    },
    aspectRatio: {
      type: Number,
      default: 1,
    },
    cols: {
      type: Object,
      default: () => ({cols: 12, sm: 6, md: 4}),
    },
  },
  methods: {
    previewImage() {
      this.$store.commit('pushDialogStack', {
        component: 'image-preview-dialog',
        elementId: `image-${this.href}`,
        data: {
          href: this.href,
          aspectRatio: this.aspectRatio,
        },
      });
    },
  }
}
</script>

<style lang="css" scoped>
.image {
  cursor: zoom-in;
  cursor: -webkit-zoom-in;
  cursor: -moz-zoom-in;
  max-height: 400px;
  max-width: 100%;
}
</style>

