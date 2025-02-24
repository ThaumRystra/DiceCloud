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
              :label="$t('DocEditForm.x69gyxffuSguaHXvQ56H7')"
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
              :label="$t('DocEditForm.ibL0uSJEY48oXcP1KRfhZ')"
              :value="doc.urlName"
              :hint="$t('DocEditForm.iYa364MzsI7qeI-Hqqvqp')"
              @change="(value, ack) => change({path: ['urlName'], value, ack})"
            />
            <v-menu
              bottom
              left
              transition="slide-y-transition"
            >
              <template #activator="{ on }">
                <v-btn
                  icon
                  style="height: 56px; width: 56px;"
                  v-on="on"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  @click="remove()"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ $t('DocEditForm.pblwi8OgupFn22G1Nw-oY') }}
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-icon>mdi-delete</v-icon>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              :label="$t('DocEditForm.rlg1W1Bi9d_cFlgtCvR7K')"
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
              :label="$t('DocEditForm.fdnsRCx5WMZngX4lcEfYv')"
              :value="doc.icon"
              @change="(value, ack) => change({path: ['icon'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <text-area
              :label="$t('DocEditForm.B_3-X2h_ufATd8alPiO5O')"
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
            outlined
            color="accent"
            style="width: 100%; height: 240px;"
            @click="ack => add({ ack })"
          >
            {{ $t('DocEditForm.j7Vpqo3j1Sz29ubpKb0LR') }}
          </smart-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="js">
import Docs, {
  insertDoc,
  pullFromDoc,
  pushToDoc,
  restoreDoc,
  softRemoveDoc,
  updateDoc,
} from '/imports/api/docs/Docs';
import { get } from 'lodash';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import DocCard from '/imports/client/ui/docs/DocCard.vue';
import getDocLink from '/imports/client/ui/docs/getDocLink';

export default {
  components: {
    DocCard
  },
  props: {
    doc: {
      type: Object,
      default: undefined,
    },
    childDocs: {
      type: Array,
      required: true,
    },
  },
  computed: {
    docId() {
      return this.doc?._id;
    },
  },
  methods: {
    change({ path, value, ack }) {
      updateDoc.call({ _id: this.docId, path, value }, ack);
      if (path[0] === 'urlName' && path.length === 1 && value) {
        this.$router.push(getDocLink(this.doc, value));
      }
    },
    push({ path, value, ack }) {
      pushToDoc.call({ _id: this.docId, path, value }, ack);
    },
    pull({ path, ack }) {
      let itemId = get(this.model, path)._id;
      path.pop();
      pullFromDoc.call({ _id: this.docId, path, itemId }, ack);
    },
    add({ ack }) {
      insertDoc.call({
        doc: {
          name: this.$t('DocEditForm.jLbuJuy5M6aZO3Y2egMz7'),
        },
        parentId: this.docId,
      }, ack);
    },
    remove({ ack }) {
      const _id = this.docId;
      const docName = this.doc.name;
      let parentHref = '/docs';
      if (this.doc.parent) {
        const parent = Docs.findOne({ _id: this.doc.parentId });
        parentHref = parent?.href || parentHref;
      }
      softRemoveDoc.call({ _id }, (error) => {
        ack?.(error);
        if (!error) {
          snackbar({
            text: this.$t('DocEditForm.SA6oEM0EnAeoxVuV5HTAg', [docName]),
            callbackName: 'undo',
            callback() {
              restoreDoc.call({ _id });
            },
          });
        }
      });
      this.$router.push(parentHref);
    },
  }
}
</script>