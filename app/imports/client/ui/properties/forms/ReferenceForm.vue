<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';
import updateReferenceNodeMethod from '/imports/api/library/methods/updateReferenceNode';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), {
  errors: () => ({}),
});

const emit = defineEmits(['change']);

const store = useStore(key);
const linkLoading = ref(false);

function changeReference() {
  store.commit('pushDialogStack', {
    component: 'select-library-node-dialog',
    elementId: 'change-ref',
    callback(node: any) {
      if (!node) return;
      linkLoading.value = true;
      emit('change', {
        path: ['ref'],
        value: {
          id: node._id,
          collection: 'libraryNodes',
        },
        ack() {
          linkLoading.value = false;
        },
      });
    },
  });
}

async function updateReferenceNode() {
  if (!props.model._id) return;
  linkLoading.value = true;
  try {
    await updateReferenceNodeMethod.callAsync({ _id: props.model._id });
  } finally {
    linkLoading.value = false;
  }
}
</script>

<template lang="html">
  <div class="reference-form">
    <v-row dense>
      <v-col cols="12">
        <outlined-input
          v-ripple
          name="Linked Property"
          class="pa-4 mb-6"
          data-id="change-ref"
          style="cursor: pointer;"
          @click="changeReference"
        >
          <v-progress-circular
            v-if="linkLoading"
            indeterminate
          />
          <div
            v-else
            class="d-flex align-center"
          >
            <v-icon class="mr-4">
              mdi-vector-link
            </v-icon>
            <div class="flex-grow-1">
              <tree-node-view
                v-if="model && model.cache && model.cache.node"
                :model="model.cache.node"
              />
              <div v-else>
                {{ model.cache.node && model.cache.node.name || model.ref && model.ref.id }}
              </div>
              <div
                v-if="model.cache.library && model.cache.library.name"
                class="text-caption"
              >
                {{ model.cache.library && model.cache.library.name }}
              </div>
              <div
                v-if="model.cache.error || errors.ref"
                class="text-error"
              >
                {{ model.cache.error || errors.ref }}
              </div>
            </div>
            <v-btn
              class="ml-4"
              icon
              @click.stop="updateReferenceNode"
            >
              <v-icon>
                mdi-refresh
              </v-icon>
            </v-btn>
          </div>
        </outlined-input>
      </v-col>
    </v-row>
    <form-sections
      v-if="$slots.default"
      type="reference"
    >
      <slot />
    </form-sections>
  </div>
</template>

<style lang="css" scoped></style>
