<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#/">20 Questions Game</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav v-if="token">
          <b-nav-item href="#/games">Active Games</b-nav-item>
          <b-nav-item href="#/gamesFinished">Finished Games</b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item v-if="token" @click.stop="onLogout">Logout</b-nav-item>
          <template v-else>
            <b-nav-item-dropdown text="Login" right>
              <b-dropdown-item href="#/user/login">Login</b-dropdown-item>
              <b-dropdown-item href="#/user/register">Register</b-dropdown-item>
            </b-nav-item-dropdown>
          </template>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-container>
      <router-view></router-view>
    </b-container>
  </div>
</template>

<script>
import router from "./router";

export default {
  name: "app",
  data() {
    return {
      token: localStorage.getItem("token")
    };
  },
  methods: {
    onLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      router.push({ name: "Home" });
      this.token = "";
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
