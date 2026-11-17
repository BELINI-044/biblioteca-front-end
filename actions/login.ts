'use server';

import axios from 'axios';
import publicApi from '@/lib/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

type LoginState = {
    error: string | null;
};

type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        name: string;
        email: string;
        isAdmin: boolean;
    };
};

export async function login(
    _prevState: LoginState,
    formData: FormData
): Promise<LoginState> {

    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!email || !password) {
        return {
            error: 'Informe seu e-mail e sua senha.',
        };
    }

    try {
        const response = await publicApi.post<LoginResponse>(
            '/auth/login',
            { email, password }
        );

        const data = response.data;

        if (!data.accessToken || !data.refreshToken) {
            return {
                error: 'Resposta de autenticação inválida.',
            };
        }

        const cookieStore = await cookies();

        cookieStore.set('accessToken', data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 15,
        });

        cookieStore.set('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.error;

            return {
                error: typeof message === 'string'
                    ? message
                    : 'E-mail ou senha inválidos.',
            };
        }

        return {
            error: 'Não foi possível conectar ao servidor.',
        };
    }

    redirect('/dashboard');
}