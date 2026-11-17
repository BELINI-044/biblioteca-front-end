
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';
import publicApi from '@/lib/api';
import LoanManager, { type Loan } from './loan-manager';

type Book = {
    id: number;
    title: string;
    availableCopies: number;
};

type Reader = {
    id: number;
    name: string;
    cpf: string;
};

async function LoansContent() {
    const token = (await cookies()).get('accessToken')?.value;

    if (!token) redirect('/');

    let loans: Loan[] = [];
    let books: Book[] = [];
    let readers: Reader[] = [];
    let errorStatus = 0;

    try {
        const headers = { Authorization: `Bearer ${token}` };

        const [loansResponse, booksResponse, readersResponse] =
            await Promise.all([
                publicApi.get<Loan[]>('/loans', { headers }),
                publicApi.get<Book[]>('/books', { headers }),
                publicApi.get<Reader[]>('/readers', { headers }),
            ]);

        loans = loansResponse.data;
        books = booksResponse.data;
        readers = readersResponse.data;
    } catch (error) {
        errorStatus = axios.isAxiosError(error)
            ? error.response?.status || 500
            : 500;
    }

    if (errorStatus === 401) redirect('/');

    if (errorStatus !== 0) {
        return (
            <div className="error-panel">
                <h2>Erro ao carregar empréstimos</h2>
                <p>Verifique se a API está funcionando.</p>
            </div>
        );
    }

    return (
        <>
            <header className="page-header">
                <div>
                    <span className="breadcrumb">BIBLIOTECA / CIRCULAÇÃO</span>
                    <h1>Empréstimos</h1>
                    <p>Controle retiradas e devoluções de livros.</p>
                </div>
                <span className="live-status">
                    <span />
                    Conectado à API
                </span>
            </header>

            <section className="welcome-panel">
                <div>
                    <span>CONTROLE DE CIRCULAÇÃO</span>
                    <h2>Empréstimos e devoluções</h2>
                    <p>
                        Registre empréstimos, acompanhe prazos e controle
                        as devoluções da biblioteca.
                    </p>
                </div>
                <div className="welcome-decoration">E</div>
            </section>

            <LoanManager
                loans={loans}
                books={books}
                readers={readers}
            />
        </>
    );
}

export default function LoansPage() {
    return (
        <Suspense fallback={<div className="loading-panel">Carregando empréstimos...</div>}>
            <LoansContent />
        </Suspense>
    );
}
