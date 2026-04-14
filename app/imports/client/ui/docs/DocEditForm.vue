<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { get } from 'lodash';
import Docs, {
  insertDoc,
  pullFromDoc,
  pushToDoc,
  restoreDoc,
  softRemoveDoc,
  updateDoc,
} from '/imports/api/docs/Docs';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import DocCard from '/imports/client/ui/docs/DocCard.vue';
import getDocLink from '/imports/client/ui/docs/getDocLink';

const props = defineProps<{
  doc?: any;
  childDocs: any[];
}>();

const router = useRouter();

const docId = computed(() => props.doc?._id);

async function change({ path, value, ack }: { path: string[]; value: any; ack?: Function }) {
  try {
    await updateDoc.callAsync({ _id: docId.value, path, value });
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
  if (path[0] === 'urlName' && path.length === 1 && value) {
    router.push(getDocLink(props.doc, value));
  }
}

async function push({ path, value, ack }: { path: string[]; value: any; ack?: Function }) {
  try {
    await pushToDoc.callAsync({ _id: docId.value, path, value });
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
}

async function pull({ path, ack }: { path: string[]; ack?: Function }) {
  const itemId = get(props.doc, path)._id;
  path.pop();
  try {
    await pullFromDoc.callAsync({ _id: docId.value, path, itemId });
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
}

async function add({ ack }: { ack?: Function }) {
  try {
    await insertDoc.callAsync({
      doc: { name: 'New Doc' },
      parentId: docId.value,
    });
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
}

async function remove({ ack }: { ack?: Function }) {
  const _id = docId.value;
  const docName = props.doc?.name;
  let parentHref = '/docs';
  if (props.doc?.parent) {
    const parent = Docs.findOne({ _id: props.doc.parentId });
    parentHref = parent?.href || parentHref;
  }
  try {
    await softRemoveDoc.callAsync({ _id });
    ack?.();
    snackbar({
      text: `Deleted ${docName}`,
      callbackName: 'undo',
      callback() {
        restoreDoc.callAsync({ _id });
      },
    });
  } catch (error: any) {
    ack?.(error);
  }
  router.push(parentHref);
}
</script>

<template>
  <v-row justify="center">
    <template v-if="doc">
      <v-col
        cols="12"
        lg="8"
      >
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              label="Title"
              :value="doc.name"
              @change="(value, ack) => change({path: ['name'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="d-flex"
          >
            <text-field
              label="URL title"
              :value="doc.urlName"
              hint="Only letters, numbers, and dashes"
              @change="(value, ack) => change({path: ['urlName'], value, ack})"
            />
            <v-menu
              location="bottom left"
              
              transition="slide-y-transition"
            >
              <template #activator="{ props }">
                <v-btn
                  icon
                  style="height: 56px; width: 56px;"
                  v-bind="props"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  @click="remove()"
                >
                  <v-list-item-title>
                    Delete
                  </v-list-item-title>
                  <template #append>
                    <v-icon>mdi-delete</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              label="Published"
              :value="doc.published"
              @change="(value, ack) => change({path: ['published'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="d-flex align-center"
          >
            <icon-picker
              label="Icon"
              :value="doc.icon"
              @change="(value, ack) => change({path: ['icon'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <text-area
              label="Body"
              :rows="20"
              :value="doc.description"
              @change="(value, ack) => change({path: ['description'], value, ack})"
            />
          </v-col>
        </v-row>
      </v-col>
    </template>
    <v-col
      cols="12"
      lg="8"
    >
      <v-row>
        <v-col
          v-for="child in childDocs"
          :key="child._id"
          cols="12"
          sm="6"
          md="4"
          xl="3"
        >
          <doc-card :doc="child" />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          md="4"
          xl="3"
        >
          <smart-btn
            single-click
            variant="outlined"
            color="accent"
            style="width: 100%; height: 240px;"
            @click="ack => add({ ack })"
          >
            Add child
          </smart-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
