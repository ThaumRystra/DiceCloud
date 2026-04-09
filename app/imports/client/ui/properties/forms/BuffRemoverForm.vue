<template lang="html">
  <div class="buff-remover-form">
    <smart-toggle
      label="Target buffs"
      :value="model.targetParentBuff ? 'parent' : 'tag'"
      :options="[
        {name: 'Remove tagged buffs', value: 'tag'},
        {name: 'Remove parent buff', value: 'parent'},
      ]"
      @change="(value, ack) => change('targetParentBuff', value === 'parent' ? true : undefined, ack)"
    />
    <v-expand-transition>
      <div v-if="!model.targetParentBuff">
        <tag-targeting
          :model="model"
          :errors="errors"
          @change="e => $emit('change', e)"
          @push="e => $emit('push', e)"
          @pull="e => $emit('pull', e)"
        />
        <div class="mb-6" />
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <smart-toggle
              label="Remove matching buffs"
              :value="model.removeAll ? 'all' : 'one'"
              :options="[
                {name: 'Remove 1 buff', value: 'one'},
                {name: 'Remove all buffs', value: 'all'},
              ]"
              @change="(value, ack) => change('removeAll', value === 'all' ? true : undefined, ack)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <smart-toggle
              label="Target creature"
              :value="model.target"
              :options="[
                {name: 'Action Target', value: 'target'},
                {name: 'Self', value: 'self'},
              ]"
              :error-messages="errors.target"
              @change="change('target', ...arguments)"
            />
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
    <form-sections type="buffRemover">
      <form-section
        v-if="$slots.children"
        name="Children"
        standalone
      >
        <slot name="children" />
      </form-section>
      <form-section
        name="Log"
      >
        <smart-switch
          label="Don't show in log"
          :value="model.silent"
          :error-messages="errors.silent"
          @change="change('silent', ...arguments)"
        />
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script setup lang="ts">
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), {
  errors: () => ({}),
});

const emit = defineEmits(['change']);

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}
</script>

<style lang="css" scoped>
</style>
