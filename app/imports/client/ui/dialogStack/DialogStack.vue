<template>
  <v-layout
    class="dialog-stack"
    align-center
    justify-center
  >
    <transition name="backdrop-fade">
      <div
        v-if="dialogs.length"
        class="backdrop"
        @click="backdropClicked"
      />
    </transition>
    <transition-group
      name="dialog-list"
      class="dialog-sizer"
      :class="{shake}"
      tag="div"
      @enter="enter"
      @leave="leave"
    >
      <v-card
        v-for="(dialog, index) in dialogs"
        :key="dialog._id"
        :ref="index"
        class="dialog"
        :data-element-id="dialog.elementId"
        :data-index="index"
        :style="getDialogStyle(index)"
        :elevation="6"
      >
        <transition name="slide">
          <component
            :is="dialog.component"
            v-bind="dialog.data"
            class="dialog-component"
            @pop="popDialogStack($event)"
          />
        </transition>
      </v-card>
    </transition-group>
  </v-layout>
</template>

<script lang="js">
  import '/imports/client/ui/dialogStack/dialogStackWindowEvents.js';
  import mockElement from '/imports/client/ui/dialogStack/mockElement.js';
  import DialogComponentIndex from '/imports/client/ui/dialogStack/DialogComponentIndex.js';

  const OFFSET = 16;
  const MOCK_DURATION = 400; // Keep in sync with css transition of .dialog

  export default {
    components: {
      ...DialogComponentIndex,
    },
    data(){return {
      hiddenElements: [],
      shake: false,
    }},
    computed: {
      dialogs(){
        return this.$store.state.dialogStack.dialogs;
      },
    },
    watch: {
      dialogs(newDialogs) {
        const el = document.documentElement;
        if (newDialogs.length) {
          this.top = el.scrollTop;
          if (el.scrollHeight > el.clientHeight){
            el.style.overflowY = 'hidden';
            el.scrollTop = this.top;
          }
        } else {
          el.style.overflowY = null;
          el.scrollTop = this.top;
        }
      }
    },
    methods: {
      popDialogStack(result){
        this.$store.dispatch('popDialogStack', result);
      },
      backdropClicked(event) {
        // If the target was not the backdrop, ignore
        if (event.target !== event.currentTarget) return;

        // If the top dialog can't be closed with the backdrop, shake shake
        const topDialog = this.dialogs[this.dialogs.length - 1];
        if (topDialog?.data?.noBackdropClose) {
          this.shakeTopDialog();
          return;
        }

        // Otherwise close the top dialog
        this.popDialogStack();
      },
      shakeTopDialog() {
        this.shake = false;
        requestAnimationFrame(() => {
          this.shake = true;
        });
      },
      getDialogStyle(index){
        const length = this.$store.state.dialogStack.dialogs.length;
        if (index >= length) return;
        const num = length - 1;
        const left = (num - index) * -OFFSET;
        const top =  (num - index) * -OFFSET;
        return `left:${left}px; top:${top}px;`;
      },
      getTopElementByDataId(elementId, offset = 0){
        let stackLength = this.$store.state.dialogStack.dialogs.length - offset;
        if (stackLength){
          let topDialog = this.$refs[stackLength - 1][0];
          // First look in the active window, then look elsewhere
          return topDialog.$el.querySelector(`.v-window-item--active [data-id='${elementId}']`) ?? 
            topDialog.$el.querySelector(`[data-id='${elementId}']`);
        } else {
          return document.querySelector(`.v-window-item--active [data-id='${elementId}']`) ??
            document.querySelector(`[data-id='${elementId}']`);
        }
      },
      enter(target, done){
        if (!target || !target.attributes['data-element-id']){
          done();
          return;
        }
        let elementId = target.attributes['data-element-id'].value;
        let source = this.getTopElementByDataId(elementId, 1);
        if (!source){
          done();
          return;
        }
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
        source.style.transition = 'none';
        source.style.opacity = '0';
        this.hiddenElements.push(source);

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
          setTimeout(done, MOCK_DURATION);
        });
      },
      leave(target, done){
        // Give minimongo time to update documents we might need to animate to
        setTimeout(() => this.doLeave(target, done));
      },
      doLeave(target, done){
        let elementId;
        let hiddenElement = this.hiddenElements.pop();
        let returnElementId = this.$store.state.dialogStack.currentReturnElement;
        if (returnElementId) {
          elementId = returnElementId;
        } else {
          if (!target || !target.attributes['data-element-id']){
            done();
            return;
          }
          elementId = target.attributes['data-element-id'].value;
        }
        let source = this.getTopElementByDataId(elementId);
        if (!source){
          console.warn(`Can't find source for ${elementId}`);
          if (hiddenElement) hiddenElement.style.opacity = null;
          done();
          return;
        }
        let index = target.attributes['data-index'].value;
        if (index != 0){
          // If we aren't the only dialog, we'll need compensate for offset
          mockElement({source, target, offset: {x: OFFSET, y: OFFSET}})
        } else {
          mockElement({source, target});
        }
        // If the source and the hidden Element are different
        // hide the source and reveal the hidden element
        let originalSourceTransition = source.style.transition;
        if (hiddenElement !== source){
          source.style.transition = 'none';
          source.style.opacity = '0';
          hiddenElement.style.opacity = null;
        }
        setTimeout(() => {
          source.style.opacity = null;
          source.style.transition = 'none';
          target.style.transition = `opacity ${MOCK_DURATION / 4}ms, pointer-events 0s`
          requestAnimationFrame(() => {
            source.style.transition = originalSourceTransition;
            target.style.opacity = '0';
            target.style.pointerEvents = 'none';
            target.style.setProperty('box-shadow', 'none', 'important');
            setTimeout(done, MOCK_DURATION / 4);
          });
        }, MOCK_DURATION);
      },
      noScroll(e){
        e.preventDefault();
      }
    }
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
    z-index: 6;
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
    z-index: 6;
  }
  .dialog-sizer {
    position: relative;
    width: 80%;
    width: calc(100% - 64px);
    max-width: 1000px;
    height: 80%;
    height: calc(100% - 64px);
    max-height: 800px;
    z-index: 7;
    flex: initial;
  }

  .dialog-sizer.shake {
    animation: shake 0.2s;
  }

  @keyframes shake {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
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
    transition: all .3s ease;
  }
  .dialog > * {
    height: 100%;
    width: 100%;
  }
</style>
