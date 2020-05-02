<template lang="html">
  <div>
    <div class="content">
      <v-card class="ma-4">
        <v-card-text>
          <v-layout
            column
            align-center
          >
            <upload-btn
              :file-changed-callback="fileChanged"
            />
            <v-text-field
              ref="iconSearchField"
              label="Search"
              append-icon="search"
              @click:append="updateSearchString"
              @keydown.enter="updateSearchString"
            />
            <v-container
              grid-list-md
              fill-height
            >
              <v-layout
                row
                wrap
              >
                <v-flex
                  v-for="icon in icons"
                  :key="icon._id._str || icon._id"
                  xs3
                  md2
                  xl1
                >
                  <v-card>
                    <v-card-title class="title">
                      {{ icon.name }}
                    </v-card-title>
                    <v-card-text>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      ><path
                        fill="#000"
                        :d="icon.shape"
                      /></svg>
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-layout>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
  import importIcons from '/imports/ui/icons/importIcons.js';
  import Icons from '/imports/api/icons/Icons.js';

  export default {
    data(){ return {
      searchString: '',
    }},
    methods: {
      fileChanged (file) {
        importIcons(file);
      },
      updateSearchString(){
        this.searchString = this.$refs.iconSearchField.internalValue;
      },
    },
    meteor: {
      $subscribe: {
        searchIcons() {
          return [this.searchString];
        },
      },
      icons(){
        return Icons.find({}, { sort: [['score', 'desc']] });
      },
    },
  };
</script>

<style lang="css" scoped>
  svg {
    height: 64px;
    width: 64px;
  }
  .v-card {
    height: 100%;
  }
</style>
