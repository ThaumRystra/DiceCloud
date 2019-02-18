<template>
  <dialog-base>
    <div slot="toolbar">
      Test Dialog
    </div>
    <div>
			<v-btn @click="openDialog('btn')" data-id="btn">Open Dialog</v-btn>
      <v-btn fab @click="openDialog('fab')" data-id="fab" color="green">Open Dialog</v-btn>
    </div>
  </dialog-base>
</template>

<script>
  import store from "/imports/ui/vuexStore.js";
  import DialogBase from "/imports/ui/dialogStack/DialogBase.vue";
  const component = {
    methods: {
      openDialog(elementId){
        store.commit("pushDialogStack", {
          component,
					elementId,
        });
      }
    },
    components: {
      DialogBase,
    },
  };
  export default component;
</script>
