import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import api from '@/app/api/axios';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const response = await api.get('/user');
                setUser(response.data.data);
            } catch (error) {
                console.log('User not authenticated');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [setUser]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return <>{children}</>;
}
