<template>
    <h2>Home</h2>
    <HelloWorld msg='Hello'></HelloWorld>
    <div>
        <button @click="logout()">Logout</button>
    </div>
</template>

<script lang="ts">
import * as client from '@app/client';
import { defineComponent } from 'vue';

import { RouteNames } from '../router';
import { useAuth } from '../common/auth';

import HelloWorld from '../components/HelloWorld.vue';

export default defineComponent({
    name: 'Home',
    components: {
        HelloWorld
    },
    data() {
        return {};
    },
    setup() {
        const { logout } = useAuth();
        return { authLogout: logout };
    },
    async created() {

    },
    methods: {
        async logout() {
            await this.authLogout();
            this.$router.replace({ name: RouteNames.Login })
        }
    }
})
</script>

<style lang='scss' scoped>
 
</style>
