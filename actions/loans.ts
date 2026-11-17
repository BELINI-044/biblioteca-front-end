
'use server';

import axios from 'axios';
import publicApi from '@/lib/api';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export type LoanState = {
    error: string | null;
    success: string | null;
};

export async function createLoan(
    _prevState: LoanState,
    formData: FormData
): Promise<LoanState> {
    const token = (await cookies()).get('accessToken')?.value;

    if (!token) {
        return { error: 'Faça login novamente.', success: null };
    }

    const bookId = Number(formData.get('bookId'));
    const readerId = Number(formData.get('readerId'));

    if (!Number.isInteger(bookId) || bookId <= 0 ||
        !Number.isInteger(readerId) || readerId <= 0) {
        return {
            error: 'Selecione um livro e um leitor válidos.',
            success: null,
        };
    }

    try {
        await publicApi.post(
            '/loans',
            { bookId, readerId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        revalidatePath('/dashboard/emprestimos');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/livros');
        revalidatePath('/dashboard/leitores');

        return {
            error: null,
            success: 'Empréstimo registrado com sucesso!',
        };
    } catch (error) {
        return {
            error: axios.isAxiosError(error)
                ? error.response?.data?.error || 'Não foi possível registrar o empréstimo.'
                : 'Erro inesperado ao registrar empréstimo.',
            success: null,
        };
    }
}

export async function returnLoan(
    _prevState: LoanState,
    formData: FormData
): Promise<LoanState> {
    const token = (await cookies()).get('accessToken')?.value;
    const id = Number(formData.get('id'));

    if (!token || !Number.isInteger(id) || id <= 0) {
        return {
            error: 'Sessão inválida ou empréstimo não informado.',
            success: null,
        };
    }

    try {
        await publicApi.patch(
            `/loans/${id}/return`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        revalidatePath('/dashboard/emprestimos');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/livros');
        revalidatePath('/dashboard/leitores');

        return {
            error: null,
            success: 'Devolução registrada com sucesso!',
        };
    } catch (error) {
        return {
            error: axios.isAxiosError(error)
                ? error.response?.data?.error || 'Não foi possível registrar a devolução.'
                : 'Erro inesperado ao registrar devolução.',
            success: null,
        };
    }
}
