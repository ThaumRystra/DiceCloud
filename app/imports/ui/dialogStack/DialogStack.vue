<template>
  <v-layout class="dialog-stack" align-center justify-center>
    <div
      class="backdrop"
      @click="backdropClicked"
      :class="dialogs.length ? '' : 'hidden' "
    ></div>
    <transition-group name="dialog-list" class="dialog-sizer" tag="div">
      <div
        v-for="(dialog, index) in dialogs"
        :key="dialog._id"
        class="dialog"
        :style="getDialogStyle(index)"
      >
        <component :is="dialog.component" :data="dialog.data" @pop="popDialogStack($event)"></component>
      </div>
    </transition-group>
  </v-layout>
</template>

<script>
  import "/imports/ui/dialogStack/dialogStackWindowEvents.js";
  import store from "/imports/ui/vuexStore.js";
  import anime from "animejs";

  const offset = 16;

  export default {
    computed: {
      dialogs(){
        return store.state.dialogStack.dialogs;
      },
    },
    methods: {
      popDialogStack(result){
        store.dispatch("popDialogStack", result);
      },
      backdropClicked(event){
        if (event.target === event.currentTarget) this.popDialogStack();
      },
      getDialogStyle(index){
        const length = store.state.dialogStack.dialogs.length;
    		if (index >= length) return;
    		const num = length - 1;
    		const left = (num - index) * -offset;
    		const top =  (num - index) * -offset;
    		return `left:${left}px; top:${top}px;`;
      },
    },
  };
</script>

<style scoped>
  .dialog-stack {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
  .dialog-sizer {
    position: relative;
    height: 600px;
    width: 600px;
    z-index: 5;
    flex: initial;
  }
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 4;
    pointer-events: initial;
  }
  .backdrop.hidden {
    display: none
  }
  .dialog-list-move {
    transition: transform 400ms;
  }
  .dialog-list-leave-active {

  }
  .dialog {
    position: absolute;
    height: 100%;
    width: 100%;
    pointer-events: initial;
  }
  .dialog > * {
    height: 100%;
    width: 100%;
  }
</style>
