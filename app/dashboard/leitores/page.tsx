
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';
import publicApi from '@/lib/api';
import ReaderManager, { type Reader } from './reader-manager';

async function ReadersContent() {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) redirect('/');

    let readers: Reader[];

    try {
        const response = await publicApi.get<Reader[]>('/readers', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        readers = response.data;
    } catch (error) {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 401
        ) {
            redirect('/');
        }

        return (
            <div className="error-panel">
                <h2>Erro ao carregar leitores</h2>
                <p>Verifique se a API está funcionando.</p>
            </div>
        );
    }

    return (
        <>
            <header className="page-header">
                <div>
                    <span className="breadcrumb">
                        BIBLIOTECA / CADASTROS
                    </span>
                    <h1>Leitores</h1>
                    <p>
                        Gerencie os leitores cadastrados na biblioteca.
                    </p>
                </div>

                <span className="live-status">
                    <span />
                    Conectado à API
                </span>
            </header>

            <section className="welcome-panel">
                <div>
                    <span>GESTÃO DE LEITORES</span>
                    <h2>Cadastro de leitores</h2>
                    <p>
                        Consulte, pesquise, cadastre e atualize
                        os dados dos leitores da biblioteca.
                    </p>
                </div>

                <div className="welcome-decoration">L</div>
            </section>

            <ReaderManager readers={readers} />
        </>
    );
}

export default function ReadersPage() {
    return (
        <Suspense fallback={
            <div className="loading-panel">
                Carregando leitores...
            </div>
        }>
            <ReadersContent />
        </Suspense>
    );
}
