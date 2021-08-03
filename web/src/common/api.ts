import * as client from '@app/client';
import { useAuth } from './auth';
export function useApi() {
    const { getToken } = useAuth();
    const getConfig = () => {
        const token = getToken();
        if (token) {
            return new client.Configuration({ basePath: import.meta.env.VITE_SERVICE_HOST, accessToken: token });
        }
        return new client.Configuration({ basePath: import.meta.env.VITE_SERVICE_HOST });
    };
    return { getConfig }
}