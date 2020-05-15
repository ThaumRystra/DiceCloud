<template>
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Test Dialog
    </v-toolbar-title>
    <div>
      <v-btn
        data-id="btn"
        @click="openDialog('btn')"
      >
        Open Dialog
      </v-btn>
      <v-btn
        fab
        data-id="fab"
        color="green"
        @click="openDialog('fab')"
      >
        Open Dialog
      </v-btn>
    </div>
  </dialog-base>
</template>

<script>
  import store from '/imports/ui/vuexStore.js';
  import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
  const component = {
    methods: {
      openDialog(elementId){
        store.commit('pushDialogStack', {
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
