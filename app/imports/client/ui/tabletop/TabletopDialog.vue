<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import TabletopForm from '/imports/client/ui/tabletop/TabletopForm.vue';
import Tabletops from '/imports/api/tabletop/Tabletops';
import TabletopViewer from '/imports/client/ui/tabletop/TabletopViewer.vue';
import { assertCanEditTabletop } from '/imports/api/tabletop/methods/shared/tabletopPermissions';
import updateTabletop from '/imports/api/tabletop/methods/updateTabletop';
import removeTabletop from '/imports/api/tabletop/methods/removeTabletop';
import updateTabletopSharing from '/imports/api/tabletop/methods/updateTabletopSharing';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  tabletopId: string;
  startInEditTab?: boolean;
}>();

const store = useStore(key);
const router = useRouter();
const editing = ref(!!props.startInEditTab);

subscribe(() => ['tabletopUsers', props.tabletopId]);

const { result: model } = autorun(() => Tabletops.findOne(props.tabletopId));

const { result: editPermission } = autorun(() => {
  const userId = Meteor.userId();
  if (!userId) return false;
  try {
    assertCanEditTabletop(model.value, userId);
    return true;
  } catch (e) {
    return false;
  }
});

const { result: users } = autorun(() => {
  if (!model.value) return;
  const m = model.value as any;
  return {
    owner: Meteor.users.findOne(m.owner),
    gameMasters: Meteor.users.find({ _id: { $in: m.gameMasters } }).fetch(),
    players: Meteor.users.find({ _id: { $in: m.players } }).fetch(),
    spectators: Meteor.users.find({ _id: { $in: m.spectators } }).fetch(),
  };
});

function notImplemented() {
  snackbar({ text: 'Not implemented' });
}

function toggleEditing() {
  editing.value = !editing.value;
}

async function changeEvent({ path, value, ack }: { path: any; value: any; ack: Function }) {
  let resolvedPath = path;
  if (typeof path === 'string') resolvedPath = path.split('.');
  try {
    await updateTabletop.callAsync({ _id: props.tabletopId, path: resolvedPath, value });
    ack();
  } catch (error: any) {
    ack(error);
  }
}

async function updateSharingEvent({ userId, role, ack }: { userId: string; role: string; ack?: Function }) {
  try {
    await updateTabletopSharing.callAsync({ tabletopId: props.tabletopId, userId, role });
    ack?.();
  } catch (error: any) {
    ack?.(error);
  }
}

function removeTabletopFn() {
  const tabletopId = props.tabletopId;
  store.commit('pushDialogStack', {
    component: 'delete-confirmation-dialog',
    elementId: 'remove-btn',
    data: { name: (model.value as any)?.name, typeName: 'Tabletop' },
    async callback(confirmation: boolean) {
      if (!confirmation) return;
      store.dispatch('popDialogStack');
      try {
        await removeTabletop.callAsync({ tabletopId });
      } catch (error: any) {
        snackbar({ text: error.reason || error.message || error.toString() });
        console.error(error);
      }
      if (router.currentRoute.value.path !== '/tabletops') {
        router.push('/tabletops');
      }
    },
  });
}
</script>

<template lang="html">
  <dialog-base v-if="model">
    <template #toolbar>
      <v-toolbar-title>
        {{ model.name || 'Unnamed Tabletop' }}
      </v-toolbar-title>
      <v-spacer />
      <v-slide-x-transition>
        <v-btn
          v-if="editing"
          icon
          :disabled="editPermission === false"
          data-id="remove-btn"
          @click="removeTabletop"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-slide-x-transition>
      <v-btn
        rounded="0"
        variant="outlined"
        @click="toggleEditing"
      >
        <span style="width: 44px;">
          {{ editing ? 'Done' : 'Edit' }}
        </span>
        <v-slide-y-transition hide-on-leave>
          <v-icon
            v-if="editing"
            key="doneIcon"
            end
          >
            mdi-check
          </v-icon>
          <v-icon
            v-else
            key="createIcon"
            end
          >
            mdi-pencil
          </v-icon>
        </v-slide-y-transition>
      </v-btn>
    </template>
    <v-fade-transition mode="out-in">
      <tabletop-form
        v-if="editing"
        key="tabletop-form"
        :model="model"
        :edit-permission="editPermission"
        :users="users"
        @change="changeEvent"
        @update-sharing="updateSharingEvent"
      />
      <tabletop-viewer
        v-else
        key="tabletop-viewer"
        :model="model"
        :users="users"
      />
    </v-fade-transition>
    <template #actions>
      <div class="layout">
        <v-btn
          variant="text"
          @click="$store.dispatch('popDialogStack')"
        >
          Close
        </v-btn>
        <v-spacer />
        <v-btn
          color="accent"
          :to="`/tabletop/${model._id}`"
          @click="$store.dispatch('popDialogStack')"
        >
          Launch
          <v-icon
            end
            dark
          >
            mdi-play
          </v-icon>
        </v-btn>
      </div>
    </template>
  </dialog-base>
</template>
