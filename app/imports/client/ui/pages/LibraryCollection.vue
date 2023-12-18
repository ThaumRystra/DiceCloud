<template lang="html">
  <v-container class="pa-6">
    <v-row
      v-if="collection && collection.description"
      justify="center"
      align="stretch"
    >
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-text>
            <markdown-text :markdown="collection.description" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row
      align="stretch"
    >
      <v-col
        v-for="library in libraries"
        :key="library._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
      >
        <v-card
          style="height: 100%;"
          :to="{name: 'singleLibrary', params: {id: library._id}}"
        >
          <v-card-title>
            {{ library.name }}
          </v-card-title>
          <v-card-text>
            <markdown-text :markdown="library.description" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row> 
  </v-container>
</template>

<script lang="js">
import LibraryCollections from '/imports/api/library/LibraryCollections';
import Libraries from '/imports/api/library/Libraries';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';

export default {
  components: {
    MarkdownText,
  },
  meteor: {
    $subscribe: {
      'libraryCollection'() {
        return [this.$route.params.id];
      },
    },
    collection() {
      return LibraryCollections.findOne(this.$route.params.id);
    },
    libraries() {
      if (!this.collection) return;
      return Libraries.find({
        _id: { $in: this.collection.libraries },
      });
    }
  }   
}
</script>
