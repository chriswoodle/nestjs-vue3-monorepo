<template>
  <router-view></router-view>
</template>

<script lang="ts">
import * as client from '@app/client';
import { defineComponent } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld
  },
  async created() {
      console.log(import.meta.env.VITE_SERVICE_HOST);
      const config = new client.Configuration({ basePath: import.meta.env.VITE_SERVICE_HOST})
    const response = await new client.StatusApi(config).statusControllerStatus();
    console.log(response);
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
