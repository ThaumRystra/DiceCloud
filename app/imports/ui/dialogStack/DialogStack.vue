<template>
  <v-layout class="dialog-stack" align-center justify-center>
		<transition name="backdrop-fade">
			<div
				class="backdrop"
				@click="backdropClicked"
				v-if="dialogs.length"
			></div>
		</transition>
    <transition-group
			name="dialog-list"
			class="dialog-sizer"
			tag="div"
			@enter="enter"
			@leave="leave"
		>
			<div class="sibling" key="sibling"/>
      <v-card
        v-for="(dialog, index) in dialogs"
        :key="dialog._id"
        class="dialog"
				:data-element-id="dialog.elementId"
				:data-index="index"
				:style="getDialogStyle(index)"
				:elevation="6"
      >
        <component :is="dialog.component" :data="dialog.data" @pop="popDialogStack($event)" class="dialog-component"></component>
      </v-card>
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
	const MOCK_DURATION = 400; // Keep in sync with css transition of .dialog

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
					backgroundColor: target.style.backgroundColor,
					borderRadius: target.style.borderRadius,
					transition: target.style.transition,
					boxShadow: target.style.boxShadow,
					sourceTransition: source.style.transition,
				}

				// hide the source
				source.style.transition = "none";
				source.style.opacity = "0";

				// Instantly mock the source
				target.style.transition = 'none';
				mockElement({source, target});

				// on the next animation frame, repair the styles
				requestAnimationFrame(() => {
					target.style.transform = originalStyle.transform;
					target.style.backgroundColor = originalStyle.backgroundColor;
					target.style.borderRadius = originalStyle.borderRadius;
					target.style.transition = originalStyle.transition;
					target.style.boxShadow = originalStyle.boxShadow;
					source.style.transition = originalStyle.sourceTransition;
					setTimeout(() => done, MOCK_DURATION);
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
					let originalTransition = source.style.transition;
					source.style.opacity = null;
					source.style.transition = 'none';
					target.style.transition = `opacity ${MOCK_DURATION / 4}ms, pointer-events 0s`
					requestAnimationFrame(() => {
						source.style.transition = originalTransition;
						target.style.opacity = "0";
						target.style.pointerEvents = "none";
						target.style.setProperty('box-shadow', "none", 'important');
						setTimeout(done, MOCK_DURATION / 4);
					});
				}, MOCK_DURATION);
			}
    },
  };
</script>

<style scoped>
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
	.backdrop-fade-enter-active, .backdrop-fade-leave-active {
		transition: opacity 0.3s;
	}
	.backdrop-fade-enter, .backdrop-fade-leave-to {
		opacity: 0;
	}
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
		width: 80%;
		width: calc(100% - 64px);
    max-width: 1000px;
		height: 80%;
    height: calc(100% - 64px);
    max-height: 800px;
    z-index: 5;
    flex: initial;
  }
	/* sm */
	@media only screen and (max-width:  960px) and (min-width:  601px){
		.dialog-sizer {
			width: calc(100% - 32px);
			height: calc(100% - 32px);
	  }
	}
	/* xs */
	@media only screen and (max-width: 600px) {
		.dialog-sizer {
			width: 100%;
			height: 100%;
	  }
	}
	.dialog-list-enter .dialog-component, .dialog-list-leave-to .dialog-component {
		opacity: 0;
	}
	.dialog-list-enter-active .dialog-component {
		transition: opacity 0.3s;
	}
	.dialog-list-leave-active .dialog-component {
		transition: opacity 0.3s 0.1s;
	}
	.dialog-list-enter-active {
		transition: all 0.4s, box-shadow 0.1s;
	}
	.dialog-list-leave-active {
		transition: all 0.4s, box-shadow 0.1s 0.3s, opacity 0.1s, pointer-events 0s;
	}
  .dialog {
		transform-origin: top left;
    position: absolute;
    height: 100%;
    width: 100%;
    pointer-events: initial;
		z-index: 1;
		overflow: hidden;
  }
  .dialog > * {
    height: 100%;
    width: 100%;
  }
</style>
