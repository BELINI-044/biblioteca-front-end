
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';
import publicApi from '@/lib/api';
import AuthorManager, { type Author } from './author-manager';

async function AuthorsContent() {
    const token = (await cookies()).get('accessToken')?.value;

    if (!token) redirect('/');

    let authors: Author[] = [];
    let isAdmin = false;
    let errorStatus = 0;

    try {
        const headers = { Authorization: `Bearer ${token}` };

        const [authorsResponse, meResponse] = await Promise.all([
            publicApi.get<Author[]>('/authors', { headers }),
            publicApi.get('/auth/me', { headers }),
        ]);

        authors = authorsResponse.data;
        isAdmin = meResponse.data.user.isAdmin === true;
    } catch (error) {
        errorStatus = axios.isAxiosError(error)
            ? error.response?.status || 500
            : 500;
    }

    if (errorStatus === 401) redirect('/');

    if (errorStatus !== 0) {
        return (
            <div className="error-panel">
                <h2>Erro ao carregar autores</h2>
                <p>Verifique a conexão com a API.</p>
            </div>
        );
    }

    return (
        <>
            <header className="page-header">
                <div>
                    <span className="breadcrumb">BIBLIOTECA / CADASTROS</span>
                    <h1>Autores</h1>
                    <p>Gerencie os autores do acervo.</p>
                </div>
                <span className="live-status">
                    <span />
                    Conectado à API
                </span>
            </header>

            <section className="welcome-panel">
                <div>
                    <span>GESTÃO DE AUTORES</span>
                    <h2>Autores da biblioteca</h2>
                    <p>Consulte, pesquise e mantenha os dados dos autores cadastrados.</p>
                </div>
                <div className="welcome-decoration">A</div>
            </section>

            <AuthorManager authors={authors} isAdmin={isAdmin} />
        </>
    );
}

export default function AuthorsPage() {
    return (
        <Suspense fallback={<div className="loading-panel">Carregando autores...</div>}>
            <AuthorsContent />
        </Suspense>
    );
}
