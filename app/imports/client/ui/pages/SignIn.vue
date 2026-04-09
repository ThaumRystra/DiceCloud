<template>
  <div>
    <v-form
      ref="form"
      class="mt-4"
    >
      <div
        class="d-flex flex-column align-center"
      >
        <v-img
          src="crown-dice-logo-cropped-transparent.png"
          width="120px"
          class="ma-3"
        />
        <v-text-field
          v-model="name"
          type="text"
          label="Username or email"
          :rules="nameRules"
          class="ma-2"
          variant="outlined"
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="password"
          type="password"
          label="Password"
          :rules="passwordRules"
          class="ma-2"
          variant="outlined"
          required
          @keyup.enter="submit"
        />
        <v-btn
          variant="text"
          to="/reset-password"
        >
          Reset Password
        </v-btn>
        <div
          v-if="error"
          class="text-error"
        >
          {{ error }}
        </div>
        <div class="d-flex">
          <v-btn
            :disabled="!valid"
            color="accent"
            class="ma-2"
            @click="submit"
          >
            Sign In
          </v-btn>
          <v-btn
            color="accent"
            :to="{ name: 'register', query: { redirect: route.query.redirect} }"
            class="ma-2"
          >
            Register
          </v-btn>
        </div>
        <div class="text-caption mt-4 px-4">
          <p>
            DiceCloud Version 2 requires a new account to use.
          </p><p>
            Version 1 is still available at <a href="https://v1.dicecloud.com">v1.dicecloud.com</a>
          </p>
        </div>
      </div>
    </v-form>
    <v-divider class="ma-4" />
    <div
      class="d-flex flex-column align-center"
    >
      <div class="text-error">
        {{ googleError }}
      </div>
      <v-btn
        color="accent"
        class="ma-2"
        @click="googleLogin"
      >
        Sign in with Google
      </v-btn>
      <div class="text-error">
        {{ patreonError }}
      </div>
      <v-btn
        color="accent"
        class="ma-2"
        @click="patreonLogin"
      >
        Sign in with Patreon
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const form = ref<any>(null);
const valid = ref(true);
const name = ref('');
const nameRules = [
  (v: string) => !!v || 'Name is required',
];
const password = ref('');
const passwordRules = [
  (v: string) => !!v || 'Password is required',
];
const error = ref('');
const googleError = ref('');
const patreonError = ref('');

async function submit() {
  const { valid: isValid } = await form.value?.validate() ?? { valid: false };
  if (!isValid) return;
  Meteor.loginWithPassword(name.value, password.value, (err: any) => {
    if (err) {
      error.value = err.reason;
    } else {
      router.push((route.query.redirect as string) || 'characterList');
    }
  });
}

function googleLogin() {
  Meteor.loginWithGoogle((err: any) => {
    if (err) {
      console.error(err);
      googleError.value = err.message;
    } else {
      router.push((route.query.redirect as string) || 'characterList');
    }
  });
}

function patreonLogin() {
  Meteor.loginWithPatreon((err: any) => {
    if (err) {
      console.error(err);
      patreonError.value = err.message;
    } else {
      router.push((route.query.redirect as string) || 'characterList');
    }
  });
}
</script>
