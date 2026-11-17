
'use server';

import axios from 'axios';
import publicApi from '@/lib/api';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type StaffState = {
    error: string | null;
    success: string | null;
};

export async function saveStaff(
    _prevState: StaffState,
    formData: FormData
): Promise<StaffState> {
    const token = (await cookies()).get('accessToken')?.value;

    if (!token) {
        return { error: 'Faça login novamente.', success: null };
    }

    const id = String(formData.get('id') || '');
    const name = String(formData.get('name') || '').trim();
    const username = String(formData.get('username') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!name || !username || !email || (!id && !password)) {
        return {
            error: 'Preencha todos os campos obrigatórios.',
            success: null,
        };
    }

    if (password && password.length < 6) {
        return {
            error: 'A senha deve ter pelo menos 6 caracteres.',
            success: null,
        };
    }

    const payload: {
        name: string;
        username: string;
        email: string;
        password?: string;
    } = { name, username, email };

    if (password) {
        payload.password = password;
    }

    try {
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        if (id) {
            await publicApi.put(`/user/${id}`, payload, config);
        } else {
            await publicApi.post('/user', payload, config);
        }

        revalidatePath('/dashboard/atendentes');

        return {
            error: null,
            success: id
                ? 'Atendente atualizado com sucesso!'
                : 'Atendente cadastrado com sucesso!',
        };
    } catch (error) {
        return {
            error: axios.isAxiosError(error)
                ? error.response?.data?.error || 'Não foi possível salvar o atendente.'
                : 'Erro inesperado ao salvar atendente.',
            success: null,
        };
    }
}

export async function toggleStaff(
    _prevState: StaffState,
    formData: FormData
): Promise<StaffState> {
    const token = (await cookies()).get('accessToken')?.value;
    const id = String(formData.get('id') || '');
    const active = formData.get('active') === 'true';

    if (!token || !id) {
        return {
            error: 'Sessão ou atendente inválido.',
            success: null,
        };
    }

    try {
        await publicApi.patch(
            `/user/${id}/active`,
            { active },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        revalidatePath('/dashboard/atendentes');

        return {
            error: null,
            success: active
                ? 'Atendente reativado!'
                : 'Atendente desativado!',
        };
    } catch (error) {
        return {
            error: axios.isAxiosError(error)
                ? error.response?.data?.error || 'Não foi possível alterar o atendente.'
                : 'Erro inesperado.',
            success: null,
        };
    }
}
