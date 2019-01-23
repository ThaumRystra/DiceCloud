<template>
  <v-layout class="dialog-stack" align-center justify-center>
    <div
      class="backdrop"
      @click="backdropClicked"
      :class="dialogs.length ? '' : 'hidden' "
    ></div>
    <transition-group
			name="dialog-list"
			class="dialog-sizer"
			tag="div"
			@enter="enter"
			@leave="leave"
		>
			<div class="sibling" key="sibling"/>
      <div
        v-for="(dialog, index) in dialogs"
        :key="dialog._id"
        class="dialog"
				:data-element-id="dialog.elementId"
				:data-index="index"
				:style="getDialogStyle(index)"
      >
        <component :is="dialog.component" :data="dialog.data" @pop="popDialogStack($event)" class="dialog-component"></component>
      </div>
    </transition-group>
  </v-layout>
</template>

<script>
  import "/imports/ui/dialogStack/dialogStackWindowEvents.js";
  import store from "/imports/ui/vuexStore.js";
  import anime from "animejs";
	import mockElement from '/imports/ui/dialogStack/mockElement.js';
	import Vue from "vue";

  const OFFSET = 16;
	const MOCK_DURATION = 8000; // Keep in sync with css transition of .dialog

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
    		const left = (num - index) * -OFFSET;
    		const top =  (num - index) * -OFFSET;
    		return `left:${left}px; top:${top}px;`;
      },
			enter(target, done){
				let elementId = target.attributes['data-element-id'].value;
				let source = document.getElementById(elementId);
				// Get the original styles so we can repair them later
				let originalStyle = {
					transform: target.style.transform,
					background: target.style.background,
					borderRadius: target.style.borderRadius,
					transition: target.style.transition,
					boxShadow: target.style.boxShadow,
					sourceTransition: source.style.transition,
				}

				// hide the source
				source.style.transition = "none";
				source.style.visibility = "hidden";

				// Instantly mock the source
				target.style.transition = 'none';
				mockElement({source, target});

				// After a full tick, repair the original styles
				Vue.nextTick(() => {
					target.style.transform = originalStyle.transform;
					target.style.background = originalStyle.background;
					target.style.borderRadius = originalStyle.borderRadius;
					target.style.transition = originalStyle.transition;
					target.style.boxShadow = originalStyle.boxShadow;
					source.style.transition = originalStyle.sourceTransition;
					setTimeout(done, MOCK_DURATION);
				});
			},
			leave(target, done){
				let elementId = target.attributes['data-element-id'].value;
				let source = document.getElementById(elementId);
				let index = target.attributes['data-index'].value;
				if (index != 0){
					// If we aren't the only dialog, we'll need compensate for offset
					mockElement({source, target, offset: {x: OFFSET, y: OFFSET}})
				} else {
					mockElement({source, target});
				}
				setTimeout(() => {
					source.style.visibility = null;
					done();
				}, MOCK_DURATION);
			}
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
		z-index: 3;
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
	.dialog-list-enter .dialog-component, .dialog-list-leave-to .dialog-component {
		opacity: 0;
	}
	.dialog-list-enter-active .dialog-component {
		transition: opacity 4s;
	}
	.dialog-list-leave-active .dialog-component {
		transition: opacity 4s 4s;
	}
  .dialog {
  	transition: all 8s;
		transform-origin: top left;
    position: absolute;
    height: 100%;
    width: 100%;
    pointer-events: initial;
		z-index: 1;
		overflow: hidden;
		background: white;
  }
  .dialog > * {
    height: 100%;
    width: 100%;
  }
</style>
