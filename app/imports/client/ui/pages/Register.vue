<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const form = ref<any>(null);
const valid = ref(true);
const username = ref('');
const usernameRules = [
  (v: string) => !!v || 'Name is required',
];
const email = ref('');
const emailRules = [
  (v: string) => !!v || 'E-mail is required',
  (v: string) => /.+@.+/.test(v) || 'E-mail must be valid',
];
const password = ref('');
const passwordRules = [
  (v: string) => !!v || 'Password is required',
];
const password2 = ref('');
const password2Rules = computed(() => [
  (v: string) => !!v || 'Password is required',
  (v: string) => v === password.value || 'Passwords don\'t match',
]);
const error = ref('');
const googleError = ref('');

async function submit() {
  const { valid: isValid } = await form.value?.validate() ?? { valid: false };
  if (!isValid) return;
  Accounts.createUser({
    username: username.value,
    password: password.value,
    email: email.value,
  }, (err: any) => {
    console.error(err);
    if (err) {
      error.value = err.reason;
    } else {
      router.push((route.query.redirect as string) || 'characterList');
    }
  });
}

function googleLogin() {
  Meteor.loginWithGoogle((err: any) => {
    if (err) googleError.value = err.reason;
  });
}
</script>

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
          v-model="email"
          type="text"
          label="Email"
          :rules="emailRules"
          class="ma-2"
          variant="outlined"
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="username"
          type="text"
          label="Username"
          :rules="usernameRules"
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
        <v-text-field
          v-model="password2"
          type="password"
          label="Password Again"
          :rules="password2Rules"
          class="ma-2"
          variant="outlined"
          required
          @keyup.enter="submit"
        />
        <div class="text-error">
          {{ error }}
        </div>
        <div class="d-flex">
          <v-btn
            :disabled="!valid"
            color="accent"
            @click="submit"
          >
            Register
          </v-btn>
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
        @click="googleLogin"
      >
        Register in with Google
      </v-btn>
    </div>
  </div>
</template>
