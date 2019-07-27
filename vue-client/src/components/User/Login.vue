<template>
  <div>
    <h4>Login</h4>
    <b-form @submit="onSubmit">
      <label for="username">Username</label>
      <div>
        <b-input id="username" type="text" v-model.trim="user.username" required autofocus />
      </div>
      <div>
        <label for="password">Password</label>
        <div>
          <b-input id="password" type="password" v-model.trim="user.password" required />
        </div>
      </div>
      <div>
        <b-button class="mt-1" type="submit" variant="primary">Login</b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import gql from "graphql-tag";
import router from "../../router";

const GET_USER = gql`
  query user($username: String!, $password: String!) {
    user(username: $username, password: $password) {
      id
      token
    }
  }
`;
export default {
  name: "Login",
  data() {
    return {
      user: {}
    };
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.$apollo
        .query({
          query: GET_USER,
          variables: {
            username: this.user.username,
            password: this.user.password
          }
        })
        .then(data => {
          localStorage.setItem("token", data.data.user.token);
          localStorage.setItem("userId", data.data.user.id);
          this.$parent.token = data.data.user.token;
          router.push({ name: "Home" });
        });
      //.catch(error => {
      //console.error(error);
      //});
    }
  }
};
</script>