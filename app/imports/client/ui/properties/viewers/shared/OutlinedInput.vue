<template>
  <fieldset
    :class="theme.isDark? 'theme--dark' :'theme--light'"
    class="outlined-input rounded v-sheet--outlined"
    @click="$emit('click', $event)"
    @dragover="$emit('dragover', $event)"
    @drop="$emit('drop', $event)"
    @dragleave="$emit('dragleave', $event)"
  >
    <legend
      v-if="name"
      class="text-caption px-1 ml-2 name"
      style="line-height: 0;"
    >
      {{ name }}
    </legend>
    <slot style="margin-top: -10px;" />
  </fieldset>
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
    }
  }
}
</script>

<style lang="css" scoped>
.outlined-input{
  transition: border-color .15s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.outlined-input.theme--light {
  border-color: rgba(0,0,0,.38);
}
.outlined-input.theme--dark {
  border-color: rgba(255,255,255,.24);
}
.outlined-input.theme--light:not(.no-hover):hover {
  border-color: rgba(0,0,0,.86);
}
.outlined-input.theme--dark:not(.no-hover):hover {
  border-color: #fff;
}
.outlined-input .name {
  color: rgba(0,0,0,.6);
}
.outlined-input.theme--dark .name {
  color: rgba(255,255,255,.7);
}
</style>
