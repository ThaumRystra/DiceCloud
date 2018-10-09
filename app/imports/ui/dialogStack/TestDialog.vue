<template>
  <dialog-base>
    <div slot="toolbar">
      Test Dialog
    </div>
    <div>
      <v-btn @click="openDialog">Open Dialog</v-btn>
    </div>
  </dialog-base>
</template>

<script>
  import store from "/imports/ui/vuexStore.js";
  import DialogBase from "/imports/ui/dialogStack/DialogBase.vue";
  const component = {
    methods: {
      openDialog(event){
        store.commit("pushDialogStack", {
          component,
        });
      }
    },
    components: {
      DialogBase,
    },
  };
  export default component;
</script>
