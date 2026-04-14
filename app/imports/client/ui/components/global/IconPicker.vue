<script setup lang="ts">
import { ref, watch, inject, useAttrs } from 'vue';
import { useSmartInput } from '/imports/client/ui/components/global/useSmartInput';
import SvgIcon from '/imports/client/ui/components/global/SvgIcon.vue';
import { findIcons } from '/imports/api/icons/Icons';

defineOptions({ inheritAttrs: false });

const context = inject<{ editPermission?: boolean }>('context', {});

const props = defineProps<{
  value?: string | number | Date | unknown[] | object | boolean;
  errorMessages?: string | string[];
  disabled?: boolean;
  debounce?: number;
  rules?: Array<(val: unknown) => string | true>;
  label?: string;
  buttonStyle?: string;
  height?: number;
  width?: number;
}>();

const emit = defineEmits<{
  change: [val: unknown, ack: (err?: unknown) => void];
  input: [val: unknown];
}>();

const attrs = useAttrs();
const { loading, safeValue, change } = useSmartInput(props, emit, attrs);

const menu = ref(false);
const searchString = ref('');
const icons = ref<any[]>([]);
const iconSearchField = ref<{ $el?: HTMLElement } | null>(null);

watch(menu, (value) => {
  if (value) {
    setTimeout(() => {
      iconSearchField.value?.$el?.querySelector('input')?.focus();
    }, 100);
  }
});

async function search(value: string, ack?: (err?: unknown) => void) {
  searchString.value = value;
  icons.value = [];
  try {
    const result = await findIcons.callAsync({ search: value });
    if (ack) ack();
    icons.value = result;
  } catch (error) {
    if (ack) ack(error);
  }
}

function select(icon?: unknown) {
  menu.value = false;
  change(icon);
}
</script>

<template lang="html">
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="slide-y-transition"
    min-width="290px"
    style="overflow-y: auto;"
    location="left"
  >
    <template #activator="{ props }">
      <v-btn
        :loading="loading"
        :variant="!!label ? 'outlined' : undefined"
        :icon="!label"
        :tile="!label"
        :min-width="label && 108"
        :height="height"
        :width="width"
        :style="buttonStyle"
        :disabled="context.editPermission === false"
        v-bind="{...$attrs, ...props}"
      >
        {{ label }}
        <svg-icon
          v-if="safeValue && safeValue.shape"
          right
          :class="{'ml-2': !!label}"
          :shape="safeValue.shape"
        />
        <v-icon
          v-else
          :end="!!label"
        >
          mdi-select-search
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-text>
        <div class="d-flex align-center">
          <text-field
            ref="iconSearchField"
            label="Search icons"
            append-icon="mdi-magnify"
            clearable
            hide-details
            class="ma-2"
            :value="searchString"
            @change="search"
          />
          <v-btn
            variant="text"
            @click="select()"
          >
            clear
          </v-btn>
        </div>
        <div
          class="d-flex flex-wrap"
          style="max-height: 400px; overflow-y: auto;"
        >
          <v-scale-transition
            group
            hide-on-leave
          >
            <v-btn
              v-for="icon in icons"
              :key="icon._id"
              icon
              size="large"
              @click="select(icon)"
            >
              <svg-icon
                :shape="icon.shape"
                size="x-large"
              />
            </v-btn>
          </v-scale-transition>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<style lang="css" scoped>

</style>
