<template>
  <div>
    <base-dialog :show="!!error" title="An error occurred" @close="handleError">
      {{ error }}
    </base-dialog>
    <base-dialog :show="isLoading" title="Authenticating..." fixed>
      <base-spinner></base-spinner>
    </base-dialog>
    <base-card>
      <form @submit.prevent="submitForm">
        <div class="form-control">
          <label for="email">E-Mail</label>
          <input type="email" id="email" v-model.trim="email" />
        </div>
        <div class="form-control">
          <label for="password">Password</label>
          <input type="password" id="password" v-model.trim="password" />
        </div>
        <p v-if="!formIsValid">
          Please enter a valid email and password (must be at least 6 characters long)
        </p>
        <base-button>{{ submitButtonCaption }}</base-button>
        <base-button type="button" mode="flat" @click="switchAuthMode">{{ switchModeButtonCaption }}</base-button>
      </form>
    </base-card>
    <button @click="googleIn">Google</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      mode: 'login',
      formIsValid: true,
      error: null,
      isLoading: false
    }
  },
  computed: {
    submitButtonCaption() {
      if (this.mode === 'login') {
        return 'Login'
      } else {
        return 'Sign up'
      }
    },
    switchModeButtonCaption() {
      if (this.mode === 'login') {
        return 'Signup instead'
      } else {
        return 'Login instead'
      }
    }
  },
  methods: {
    switchAuthMode() {
      if (this.mode === 'login') {
        this.mode = 'signup'
      } else {
        this.mode = 'login'
      }
    },
    async submitForm() {
      this.formIsValid = true

      if (this.email === '' || !this.email.includes('@') || this.password.length < 6) {
        this.formIsValid = false
        return
      }

      const dispatch = async (action) => {
        await this.$store.dispatch(action, {
          email: this.email,
          password: this.password
        })
      }

      // send http requests
      try {
        this.isLoading = true
        if (this.mode === 'login') {
          await dispatch('login')
        } else {
          await dispatch('signup')
        }

        const redirectUrl = '/' + (this.$route.query.redirect || 'coaches')
        // this.$router.replace('coaches')
        this.$router.replace(redirectUrl)
      } catch (err) {
        this.error = err.message || "Auth fail..."
      } finally {
        this.isLoading = false
      }
    },
    async googleIn() {
      await this.$store.dispatch('googleSignIn')
    },
    handleError() {
      this.error = null
    }
  }
}
</script>

<style scoped>
form {
  margin: 1rem;
  padding: 1rem;
}

.form-control {
  margin: 0.5rem 0;
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
}

input,
textarea {
  display: block;
  width: 100%;
  font: inherit;
  border: 1px solid #ccc;
  padding: 0.15rem;
}

input:focus,
textarea:focus {
  border-color: #3d008d;
  background-color: #faf6ff;
  outline: none;
}
</style>
