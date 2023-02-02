<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { RouteNames } from '../router';
import { useAuth } from '../common/auth';

const router = useRouter();

const { login } = useAuth();

const username = ref('');
const password = ref('');

async function beginLogin() {
    try {
        await login(username.value, password.value);
        router.replace({ name: RouteNames.Home })
    } catch (error) {
        console.log(error);
    }
}
</script>

<template>
    <div>
        <h2>Login</h2>
        <div class="login-form">
            <div>
                <input type="text" v-model="username" />
                <input type="password" v-model="password" />
                <button @click="beginLogin()">Login</button>
            </div>
        </div>
    </div>
</template>

<style lang='scss' scoped>
.login-form {
    display: flex;
    justify-content: center;

    >div {
        display: flex;
        flex-direction: column;
        max-width: 200px;
    }
}
</style>
