<template>
  <div
    class="dialog-stack"
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
      class="dialog-transition-group"
      :class="{shake}"
      tag="div"
      @enter="enter"
      @leave="leave"
    >
      <template v-for="(dialog, index) in dialogs">
        <component
          :is="dialog.component"
          v-if="isUnsizedDialog(dialog.component)"
          :key="dialog._id"
          :ref="index"
          v-bind="dialog.data"
          class="unsized-dialog dialog-component"
          :data-element-id="dialog.elementId"
          :data-id="dialog._id"
          :data-index="index"
          :style="getDialogStyle(index)"
          :elevation="6"
          @pop="popDialogStack($event)"
        />
        <v-card
          v-else
          :key="dialog._id"
          :ref="index"
          class="dialog"
          :data-element-id="dialog.elementId"
          :data-id="dialog._id"
          :data-index="index"
          :style="getDialogStyle(index)"
          :elevation="6"
        >
          <transition name="slide">
            <component
              :is="dialog.component"
              v-bind="dialog.data"
              class="sized-dialog dialog-component"
              @pop="popDialogStack($event)"
            />
          </transition>
        </v-card>
      </template>
    </transition-group>
  </div>
</template>

<script lang="js">
  import '/imports/client/ui/dialogStack/dialogStackWindowEvents';
  import mockElement from '/imports/client/ui/dialogStack/mockElement';
  import DialogComponentIndex from '/imports/client/ui/dialogStack/DialogComponentIndex';
  import timeout from '/imports/api/utility/timeout';

  const OFFSET = 16;
  // Use in combination with browser's animation speed override to do slow-mod debugging
  const animationSpeed = 1;

  const unsizedDialogs = new Set(['image-preview-dialog', 'action-dialog']);

  export default {
    components: {
      ...DialogComponentIndex,
    },
    data(){return {
      hiddenElements: [],
      shake: false,
      leavingPromise: undefined,
    }},
    computed: {
      dialogs(){
        return this.$store.state.dialogStack.dialogs;
      },
    },
    watch: {
      async dialogs(newDialogs) {
        const el = document.documentElement;
        if (newDialogs.length) {
          this.top = el.scrollTop;
          if (el.scrollHeight > el.clientHeight){
            el.scrollTop = this.top;
            el.classList.add('lock-scroll');
          }
        } else {
          await timeout(400 / animationSpeed);
          el.classList.remove('lock-scroll');
          el.scrollTop = this.top;
        }
      }
    },
    methods: {
      popDialogStack(result){
        this.$store.dispatch('popDialogStack', result);
      },
      isUnsizedDialog(component) {
        return unsizedDialogs.has(component);
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
        const top = (num - index) * -OFFSET;
        return `left: calc(${left}px + 50%); top: calc(${top}px + 50%);${index < num ? ' filter: brightness(0.7);': ''}`;
      },
      getTopElementByDataId(elementId, offset = 0){
        let stackLength = this.$store.state.dialogStack.dialogs.length - offset;
        if (stackLength){
          let topDialog = this.$refs[stackLength - 1][0];
          return topDialog.$el.querySelector(`.v-window-item--active [data-id='${elementId}']`)
            ?? topDialog.$el.querySelector(`[data-id='${elementId}']`)
            ?? document.querySelector(`.v-window-item--active [data-id='${elementId}']`)
            ?? document.querySelector(`[data-id='${elementId}']`);
        } else {
          return document.querySelector(`.v-window-item--active [data-id='${elementId}']`)
            ?? document.querySelector(`[data-id='${elementId}']`);
        }
      },
      async enter(target, done) {
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

        // Instantly mock the source
        target.style.transition = 'none';
        // If we are using unsized dialogs, first let it layout with no opacity, then mock and
        // carry on, otherwise it has no size
        if (target.classList.contains('unsized-dialog')) {
          target.style.opacity = '0';
          await new Promise(requestAnimationFrame);
          mockElement({ source, target });
          target.style.opacity = '1';
        } else {
          mockElement({ source, target });
        }

        // Wait one frame before hiding the source so we know our mock is in place
        await new Promise(requestAnimationFrame);
        
        // hide the source
        source.style.transition = 'none';
        source.style.opacity = '0';
        this.hiddenElements.push(source);

        // repair the styles so that our mock is undone revealing the dialog
        target.style.transform = originalStyle.transform;
        target.style.backgroundColor = originalStyle.backgroundColor;
        target.style.borderRadius = originalStyle.borderRadius;
        target.style.transition = originalStyle.transition;
        target.style.boxShadow = originalStyle.boxShadow;
        source.style.transition = originalStyle.sourceTransition;
        setTimeout(done, 300 / animationSpeed);
      },
      async leave(target, done) {
        // Give minimongo time to update documents we might need to animate to
        await new Promise(requestAnimationFrame);
        let elementId;
        let hiddenElement = this.hiddenElements.pop();
        let returnElementId = await this.$store.state.dialogStack.currentReturnElement;
        if (returnElementId) {
          elementId = returnElementId;
        } else {
          if (!target || !target.attributes['data-element-id']){
            done();
            return;
          }
          elementId = target.attributes['data-element-id'].value;
        }
        const replacing = this.$store.state.dialogStack.replacingDialog === target.attributes['data-id'].value;
        let source = this.getTopElementByDataId(elementId);
        if (!source || replacing){
          if (hiddenElement) hiddenElement.style.opacity = '';
          // Just fade out gracefully
          target.style.transition = 'all 0.3s ease';
          target.style.opacity = '0';
          await timeout(300 / animationSpeed);
          done();
          return;
        }
        let index = target.attributes['data-index'].value;

        // Disable clicking the dialog while it's animating
        target.style.pointerEvents = 'none';

        // Make the dialog mock the source
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
          if (hiddenElement) hiddenElement.style.opacity = '';
          // wait a frame for these to apply without transitions
          await new Promise(requestAnimationFrame);
        }

        // Wait for the mock to finish
        await timeout(300 / animationSpeed);

        // reveal the source immediately
        source.style.opacity = '';
        source.style.transition = 'none';

        // Wait for the opacity swap to finish
        await timeout(100 / animationSpeed);

        // Fix the transition of the source
        source.style.transition = originalSourceTransition;

        // Done
        done();
      },
      noScroll(e){
        e.preventDefault();
      }
    }
  };
</script>

<style scoped>
  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 6;
    pointer-events: initial;
    opacity: 1;
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

  .shake {
    animation: shake 0.2s;
  }

  @keyframes shake {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }

  .dialog-transition-group {
    position: relative;
    z-index: 7;
    height: 100%;
    width: 100%;
  }

  /*
    Fade in and out the dialog contents as it is animating
  */
  .dialog-list-enter .sized-dialog, .dialog-list-leave-to .sized-dialog {
    opacity: 0;
  }
  .dialog-list-enter-active .sized-dialog, .dialog-list-leave-active .sized-dialog {
    transition: opacity 0.3s;
  }

  /*
    Enter and leave with no shadow
  */
  .dialog-list-enter, .dialog-list-leave-to {
    box-shadow: none;
  }

  /*
    Leave to no opacity
  */
  .dialog-list-leave-to {
    opacity: 0;
  }

  .dialog.dialog-list-enter-active, .unsized-dialog.dialog-list-enter-active {
    transition: all 0.3s, box-shadow 0.1s, opacity 0s, pointer-events 0s;
  }
  .dialog.dialog-list-leave-active, .unsized-dialog.dialog-list-leave-active {
    transition: all 0.3s, box-shadow 0.1s 0.3s, opacity 0.1s 0.3s, pointer-events 0s;
  }

  /**
  Only the top dialog should be clickable
  */
  .dialog:last-child, .unsized-dialog:last-child {
    pointer-events: initial;
  }

  .dialog {
    height: 100%;
    width: 100%;
    max-height: 800px;
    max-width: 1000px;
  }
  .dialog, .unsized-dialog {
    transform-origin: center;
    position: absolute;
    z-index: 1;
    overflow: hidden;
    transition: all 0.3s ease;
    transform: translate(-50%, -50%) scale(1);
  }
  @media only screen and  (min-width:  601px){
    .dialog-stack {
      padding: 32px;
    }
  }
  .dialog > * {
    height: 100%;
    width: 100%;
  }
</style>
