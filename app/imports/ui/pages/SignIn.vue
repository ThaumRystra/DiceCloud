<template>
  <div>
    <v-form
      ref="form"
      class="mt-4"
    >
      <v-layout
        column
        align-center
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
          required
          @keyup.enter="submit"
        />
        <v-text-field
          v-model="password"
          type="password"
          label="Password"
          :rules="passwordRules"
          required
          @keyup.enter="submit"
        />
        <v-btn flat>
          Reset Password
        </v-btn>
        <div class="error--text">
          {{ error }}
        </div>
        <v-layout row>
          <v-btn
            :disabled="!valid"
            color="accent"
            @click="submit"
          >
            Sign In
          </v-btn>
          <v-btn
            color="accent"
            :to="{ name: 'register', query: { redirect: this.$route.query.redirect} }"
          >
            Register
          </v-btn>
        </v-layout>
      </v-layout>
    </v-form>
    <v-divider class="ma-4" />
    <v-layout
      column
      align-center
    >
      <div class="error--text">
        {{ googleError }}
      </div>
      <v-btn
        color="accent"
        @click="googleLogin"
      >
        Sign in with Google
      </v-btn>
      <div class="error--text">
        {{ patreonError }}
      </div>
      <v-btn
        color="accent"
        @click="patreonLogin"
      >
        Sign in with Patreon
      </v-btn>
    </v-layout>
  </div>
</template>

<script>
  import { Meteor } from 'meteor/meteor'
	export default{
		data: () => ({
      valid: true,
      name: '',
      nameRules: [
        v => !!v || 'Name is required',
      ],
      password: '',
      passwordRules: [
        v => !!v || 'Password is required',
      ],
			error: '',
      googleError: '',
			patreonError: '',
    }),
		methods: {
      submit () {
        if (this.$refs.form.validate()) {
					Meteor.loginWithPassword(this.name, this.password, error => {
						if (error){
							this.error = error.reason;
						} else {
              this.$router.push(this.$route.query.redirect || 'characterList');
						}
					});
        }
      },
			googleLogin() {
				Meteor.loginWithGoogle(error => {
          if (error){
            console.error(error);
            this.googleError = error.message;
          } else {
            this.$router.push(this.$route.query.redirect || 'characterList');
          }
				});
			},
      patreonLogin() {
				Meteor.loginWithPatreon(error => {
					if (error){
            console.error(error);
            this.patreonError = error.message;
          } else {
            this.$router.push(this.$route.query.redirect || 'characterList');
          }
				});
			}
    },
	}
</script>
