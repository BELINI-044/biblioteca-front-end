
'use server';

import axios from 'axios';
import publicApi from '@/lib/api';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

type FormState = {
    error: string | null;
    success: string | null;
};

export async function createBook(
    _prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
        return { error: 'Faça login novamente.', success: null };
    }

    const title = String(formData.get('title') || '').trim();
    const isbn = String(formData.get('isbn') || '').trim();
    const yearValue = String(formData.get('year') || '');
    const categoryId = Number(formData.get('categoryId'));
    const totalCopies = Number(formData.get('totalCopies'));

    const authorIds = formData
        .getAll('authorIds')
        .map(Number);

    if (!title || !isbn || !categoryId || !Number.isInteger(totalCopies) || totalCopies < 1) {
        return {
            error: 'Preencha corretamente os campos obrigatórios.',
            success: null,
        };
    }

    const year = yearValue ? Number(yearValue) : null;

    if (year !== null && (!Number.isInteger(year) || year < 0)) {
        return { error: 'Ano de publicação inválido.', success: null };
    }

    try {
        await publicApi.post('/books', {
            title,
            isbn,
            year,
            totalCopies,
            categoryId,
            authorIds,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        revalidatePath('/dashboard/livros');

        return {
            error: null,
            success: 'Livro cadastrado com sucesso!',
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                error: error.response?.data?.error || 'Não foi possível cadastrar o livro.',
                success: null,
            };
        }

        return {
            error: 'Erro inesperado ao cadastrar livro.',
            success: null,
        };
    }
}
