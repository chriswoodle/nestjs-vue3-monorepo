<template>
    <h2>Login</h2>
    <div class="login-form">
        <div>
            <input type="text" v-model="username" />
            <input type="password" v-model="password" />
            <button @click="beginLogin()">Submit</button>
        </div>
    </div>
</template>

<script lang="ts">
import * as client from '@app/client';
import { defineComponent } from 'vue'
import { RouteNames } from '../router';

import { useAuth } from '../common/auth'
export default defineComponent({
    name: 'Login',
    data() {
        return {
            username: '',
            password: ''
        }
    },
    setup() {
        const { login } = useAuth();
        return { login };
    },
    async created() {

    },
    methods: {
        async beginLogin() {
            try {
                await this.login(this.username, this.password);
                this.$router.replace({ name: RouteNames.Home })
            } catch (error) {
                console.log(error);
            }
        }
    }
})
</script>

<style lang='scss' scoped>
.login-form {
    display: flex;
    justify-content: center;
    > div {
        display: flex;
        flex-direction: column;
        max-width: 200px;
    }
}
</style>
