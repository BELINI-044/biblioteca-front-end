
'use server';

import axios from 'axios';
import publicApi from '@/lib/api';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

type AuthorState = {
    error: string | null;
    success: string | null;
};

export async function saveAuthor(
    _prevState: AuthorState,
    formData: FormData
): Promise<AuthorState> {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
        return { error: 'Faça login novamente.', success: null };
    }

    const id = String(formData.get('id') || '');
    const name = String(formData.get('name') || '').trim();
    const nationality = String(formData.get('nationality') || '').trim();
    const birthDate = String(formData.get('birthDate') || '');

    if (!name) {
        return { error: 'O nome do autor é obrigatório.', success: null };
    }

    try {
        const payload = {
            name,
            nationality: nationality || null,
            birthDate: birthDate || null,
        };

        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        if (id) {
            await publicApi.put(`/authors/${id}`, payload, config);
        } else {
            await publicApi.post('/authors', payload, config);
        }

        revalidatePath('/dashboard/autores');

        return {
            error: null,
            success: id
                ? 'Autor atualizado com sucesso!'
                : 'Autor cadastrado com sucesso!',
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                error: error.response?.data?.error || 'Erro ao salvar autor.',
                success: null,
            };
        }

        return { error: 'Erro inesperado ao salvar autor.', success: null };
    }
}
