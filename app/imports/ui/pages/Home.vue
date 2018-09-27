<template>
  <toolbar-layout>
    <div slot="toolbar">
      DiceCloud
    </div>
    <div class="content">
      <section>
        <v-parallax src="/png/paper-dice-crown.png" height="600">
          <v-layout column align-center justify-center class="white--text">
            <h1 class="white--text mb-2 display-1 text-xs-center">
              DiceCloud - Auditable, real-time character tracking for 5th edition
            </h1>
            <div class="subheading mb-3 text-xs-center">
              Spend less time shuffling paper, and more time playing the game
            </div>
          </v-layout>
        </v-parallax>
      </section>
      <section>
        <h1 class="mb-2 text-xs-center">
          Check out the example characters
        </h1>
        <v-layout row align-center justify-space-around>
          <v-card>
            <v-card-text>
              Starter set archer
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-text>
              Starter set wizard
            </v-card-text>
          </v-card>
        </v-layout>
      </section>
      <section>
        <!-- social links -->
      </section>
    </div>
  </toolbar-layout>
</template>

<script>
  import ToolbarLayout from "/imports/ui/layouts/ToolbarLayout.vue";
  export default {
    components: {
      ToolbarLayout,
    },
  };
</script>

<style>
</style>
