<template>
  <v-container>
    <v-row>
      <template v-if="archiveFiles && archiveFiles.length">
        <v-col cols="12">
          <v-subheader> Archived Characters </v-subheader>
        </v-col>
        <v-col
          v-for="file in archiveFiles"
          :key="file._id"
          cols="12"
          md="4"
          lg="3"
        >
          <v-card>
            <v-card-title>
              {{ file.meta.creatureName }}
            </v-card-title>
            <v-card-subtitle>
              {{ file.size }}
            </v-card-subtitle>
            <v-card-actions>
              <v-btn text>
                Restore
              </v-btn>
              <v-flex />
              <v-btn
                icon
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-btn
                icon
                :href="`${file.link}?download=true`"
              >
                <v-icon>mdi-download</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script lang="js">
import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles.js';
import prettyBytes from 'pretty-bytes';

export default {
  meteor: {
    $subscribe: {
      'archiveCreatureFiles': [],
    },
    archiveFiles() {
      var userId = Meteor.userId();
      return ArchiveCreatureFiles.find(
        {
          userId,
        }, {
          sort: {'size': -1},
        }
      ).map(f => {
        f.json = JSON.stringify(f, null, 2);
        f.size = prettyBytes(f.size);
        f.link = ArchiveCreatureFiles.link(f);
        return f;
      });
    },
  }
}
</script>

<style>
</style>