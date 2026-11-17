
'use server';

import axios from 'axios';
import publicApi from '@/lib/api';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

type ReaderState = {
    error: string | null;
    success: string | null;
};

export async function saveReader(
    _prevState: ReaderState,
    formData: FormData
): Promise<ReaderState> {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
        return {
            error: 'Faça login novamente.',
            success: null,
        };
    }

    const id = String(formData.get('id') || '');
    const name = String(formData.get('name') || '').trim();
    const cpf = String(formData.get('cpf') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();

    if (!name || !cpf) {
        return {
            error: 'Nome e CPF são obrigatórios.',
            success: null,
        };
    }

    const payload = {
        name,
        cpf,
        email: email || null,
        phone: phone || null,
    };

    try {
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        if (id) {
            await publicApi.put(`/readers/${id}`, payload, {
                headers,
            });
        } else {
            await publicApi.post('/readers', payload, {
                headers,
            });
        }

        revalidatePath('/dashboard/leitores');

        return {
            error: null,
            success: id
                ? 'Leitor atualizado com sucesso!'
                : 'Leitor cadastrado com sucesso!',
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                error: error.response?.data?.error ||
                    'Não foi possível salvar o leitor.',
                success: null,
            };
        }

        return {
            error: 'Erro inesperado ao salvar leitor.',
            success: null,
        };
    }
}
