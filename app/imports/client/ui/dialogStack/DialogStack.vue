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
          :ref="(el: any) => { if (el) dialogRefs[index] = el; else delete dialogRefs[index]; }"
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
          :ref="(el: any) => { if (el) dialogRefs[index] = el; else delete dialogRefs[index]; }"
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import '/imports/client/ui/dialogStack/dialogStackWindowEvents';
import mockElement from '/imports/client/ui/dialogStack/mockElement';
import DialogComponentIndex from '/imports/client/ui/dialogStack/DialogComponentIndex';
import timeout from '/imports/api/utility/timeout';

const OFFSET = 16;
const animationSpeed = 1;

const unsizedDialogs = new Set(['image-preview-dialog', 'action-dialog']);

defineOptions({ components: { ...DialogComponentIndex } });

const store = useStore();

const hiddenElements = ref<HTMLElement[]>([]);
const shake = ref(false);
const dialogRefs: Record<number, any> = {};
let top = 0;

const dialogs = computed(() => store.state.dialogStack.dialogs);

watch(dialogs, async (newDialogs: any[]) => {
  const el = document.documentElement;
  if (newDialogs.length) {
    top = el.scrollTop;
    if (el.scrollHeight > el.clientHeight) {
      el.scrollTop = top;
      el.classList.add('lock-scroll');
    }
  } else {
    await timeout(400 / animationSpeed);
    el.classList.remove('lock-scroll');
    el.scrollTop = top;
  }
});

function popDialogStack(result?: any) {
  store.dispatch('popDialogStack', result);
}

function isUnsizedDialog(component: string) {
  return unsizedDialogs.has(component);
}

function backdropClicked(event: MouseEvent) {
  if (event.target !== event.currentTarget) return;
  const topDialog = dialogs.value[dialogs.value.length - 1];
  if (topDialog?.data?.noBackdropClose) {
    shakeTopDialog();
    return;
  }
  popDialogStack();
}

function shakeTopDialog() {
  shake.value = false;
  requestAnimationFrame(() => {
    shake.value = true;
  });
}

function getDialogStyle(index: number) {
  const length = store.state.dialogStack.dialogs.length;
  if (index >= length) return;
  const num = length - 1;
  const left = (num - index) * -OFFSET;
  const topOffset = (num - index) * -OFFSET;
  return `left: calc(${left}px + 50%); top: calc(${topOffset}px + 50%);${index < num ? ' filter: brightness(0.7);' : ''}`;
}

function getTopElementByDataId(elementId: string, offset = 0) {
  const stackLength = store.state.dialogStack.dialogs.length - offset;
  if (stackLength) {
    const topDialog = dialogRefs[stackLength - 1];
    return topDialog?.$el?.querySelector(`.v-window-item--active [data-id='${elementId}']`)
      ?? topDialog?.$el?.querySelector(`[data-id='${elementId}']`)
      ?? document.querySelector(`.v-window-item--active [data-id='${elementId}']`)
      ?? document.querySelector(`[data-id='${elementId}']`);
  } else {
    return document.querySelector(`.v-window-item--active [data-id='${elementId}']`)
      ?? document.querySelector(`[data-id='${elementId}']`);
  }
}

async function enter(target: HTMLElement, done: () => void) {
  if (!target || !target.attributes.getNamedItem('data-element-id')) {
    done();
    return;
  }
  const elementId = target.attributes.getNamedItem('data-element-id')!.value;
  const source = getTopElementByDataId(elementId, 1) as HTMLElement | null;
  if (!source) {
    done();
    return;
  }
  const originalStyle = {
    transform: target.style.transform,
    backgroundColor: target.style.backgroundColor,
    borderRadius: target.style.borderRadius,
    transition: target.style.transition,
    boxShadow: target.style.boxShadow,
    sourceTransition: source.style.transition,
  };

  target.style.transition = 'none';
  if (target.classList.contains('unsized-dialog')) {
    target.style.opacity = '0';
    await new Promise(requestAnimationFrame);
    mockElement({ source, target });
    target.style.opacity = '1';
  } else {
    mockElement({ source, target });
  }

  await new Promise(requestAnimationFrame);

  source.style.transition = 'none';
  source.style.opacity = '0';
  hiddenElements.value.push(source);

  target.style.transform = originalStyle.transform;
  target.style.backgroundColor = originalStyle.backgroundColor;
  target.style.borderRadius = originalStyle.borderRadius;
  target.style.transition = originalStyle.transition;
  target.style.boxShadow = originalStyle.boxShadow;
  source.style.transition = originalStyle.sourceTransition;
  setTimeout(done, 300 / animationSpeed);
}

async function leave(target: HTMLElement, done: () => void) {
  await new Promise(requestAnimationFrame);
  let elementId: string | undefined;
  const hiddenElement = hiddenElements.value.pop();
  const returnElementId = await store.state.dialogStack.currentReturnElement;
  if (returnElementId) {
    elementId = returnElementId;
  } else {
    if (!target || !target.attributes.getNamedItem('data-element-id')) {
      done();
      return;
    }
    elementId = target.attributes.getNamedItem('data-element-id')!.value;
  }
  const replacing = store.state.dialogStack.replacingDialog === target.attributes.getNamedItem('data-id')?.value;
  const source = getTopElementByDataId(elementId) as HTMLElement | null;
  if (!source || replacing) {
    if (hiddenElement) hiddenElement.style.opacity = '';
    target.style.transition = 'all 0.3s ease';
    target.style.opacity = '0';
    await timeout(300 / animationSpeed);
    done();
    return;
  }
  const index = target.attributes.getNamedItem('data-index')?.value;

  target.style.pointerEvents = 'none';

  if (index !== '0') {
    mockElement({ source, target, offset: { x: OFFSET, y: OFFSET } });
  } else {
    mockElement({ source, target });
  }

  const originalSourceTransition = source.style.transition;
  if (hiddenElement !== source) {
    source.style.transition = 'none';
    source.style.opacity = '0';
    if (hiddenElement) hiddenElement.style.opacity = '';
    await new Promise(requestAnimationFrame);
  }

  await timeout(300 / animationSpeed);

  source.style.opacity = '';
  source.style.transition = 'none';

  await timeout(100 / animationSpeed);

  source.style.transition = originalSourceTransition;

  done();
}
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
