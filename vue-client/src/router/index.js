import VueRouter from 'vue-router';

import Home from '@/components/Home/Home';

import ListGame from '@/components/Game/List';
import ListFinishedGame from '@/components/Game/ListFinished';
import CreateGame from '@/components/Game/Create';
import DetailsGame from '@/components/Game/Details'

import Login from '@/components/User/Login';
import Register from '@/components/User/Register';

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/user/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/user/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/games',
      name: 'ListGame',
      component: ListGame
    },
    {
      path: '/gamesFinished',
      name: 'ListFinishedGame',
      component: ListFinishedGame
    },
    {
      path: '/games/create',
      name: 'CreateGame',
      component: CreateGame
    },
    {
      path: '/games/details/:id',
      name: 'DetailsGame',
      component: DetailsGame
    }
  ]
});
