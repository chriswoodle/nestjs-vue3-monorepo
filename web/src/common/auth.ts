import { NavigationGuard } from 'vue-router';
import { reactive, toRefs } from 'vue'
import * as client from '@app/client';
import { RouteNames } from '../router';

enum LocalStorageKeys {
    AuthToken = 'auth-token'
}

interface AuthState {
    accessToken: string | null
}

const state = reactive<AuthState>({
    accessToken: null
});

export function useAuth() {
    const getToken = () => {
        return localStorage.getItem(LocalStorageKeys.AuthToken);
    }

    const saveToken = (token: string) => {
        state.accessToken = token;
        localStorage.setItem(LocalStorageKeys.AuthToken, token);
    }

    const removeToken = () => {
        state.accessToken = null;
        localStorage.removeItem(LocalStorageKeys.AuthToken);
    }

    const login = async (username: string, password: string) => {
        try {
            const config = new client.Configuration({ basePath: import.meta.env.VITE_SERVICE_HOST })
            const response = await new client.AccountApi(config).accountControllerLogin({ loginRequest: { email: username, password } });
            saveToken(response.data.accessToken);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    const logout = async () => {
        const token = state.accessToken;
        if (!token) return;
        try {
            const config = new client.Configuration({ basePath: import.meta.env.VITE_SERVICE_HOST, accessToken: token })
            await new client.AccountApi(config).accountControllerLogout();
            removeToken();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    const isAuthenticated = () => {
        return !!state.accessToken;
    }

    const init = () => {
        const token = getToken();
        if (token)
            state.accessToken = token;
    }

    init();
    return {
        getToken,
        isAuthenticated,
        login,
        logout,
        ...toRefs(state)
    };
}

export const authGuard: NavigationGuard = (to, from, next) => {
    console.log('authGuard');
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated()) return next({ name: RouteNames.Login })
    return next();
}

export const unauthGuard: NavigationGuard = (to, from, next) => {
    console.log('unauthGuard');
    const { isAuthenticated } = useAuth();
    if (isAuthenticated()) return next({ name: RouteNames.Home })
    return next();
}