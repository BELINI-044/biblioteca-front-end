
'use server';

import axios from 'axios';
import publicApi from '@/lib/api';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

type CategoryState = {
    error: string | null;
    success: string | null;
};

export async function saveCategory(
    _prevState: CategoryState,
    formData: FormData
): Promise<CategoryState> {
    const token = (await cookies()).get('accessToken')?.value;

    if (!token) {
        return { error: 'Faça login novamente.', success: null };
    }

    const id = String(formData.get('id') || '');
    const name = String(formData.get('name') || '').trim();
    const description = String(formData.get('description') || '').trim();

    if (!name) {
        return { error: 'O nome da categoria é obrigatório.', success: null };
    }

    try {
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        const payload = { name, description: description || null };

        if (id) {
            await publicApi.put(`/categories/${id}`, payload, config);
        } else {
            await publicApi.post('/categories', payload, config);
        }

        revalidatePath('/dashboard/categorias');

        return {
            error: null,
            success: id
                ? 'Categoria atualizada com sucesso!'
                : 'Categoria cadastrada com sucesso!',
        };
    } catch (error) {
        return {
            error: axios.isAxiosError(error)
                ? error.response?.data?.error || 'Erro ao salvar categoria.'
                : 'Erro inesperado ao salvar categoria.',
            success: null,
        };
    }
}

export async function deleteCategory(formData: FormData) {
    const token = (await cookies()).get('accessToken')?.value;
    const id = String(formData.get('id') || '');

    if (!token || !id) {
        return;
    }

    try {
        await publicApi.delete(`/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        revalidatePath('/dashboard/categorias');
    } catch (error) {
        console.error(
            'Erro ao excluir categoria:',
            axios.isAxiosError(error)
                ? error.response?.data
                : error
        );

        throw new Error(
            axios.isAxiosError(error)
                ? error.response?.data?.error || 'Não foi possível excluir a categoria.'
                : 'Erro inesperado ao excluir categoria.'
        );
    }
}
