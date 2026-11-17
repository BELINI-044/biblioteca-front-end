
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';
import publicApi from '@/lib/api';
import CategoryManager, { type Category } from './category-manager';

async function CategoriesContent() {
    const token = (await cookies()).get('accessToken')?.value;

    if (!token) redirect('/');

    let categories: Category[] = [];
    let isAdmin = false;
    let errorStatus = 0;

    try {
        const headers = { Authorization: `Bearer ${token}` };

        const [categoriesResponse, meResponse] = await Promise.all([
            publicApi.get<Category[]>('/categories', { headers }),
            publicApi.get('/auth/me', { headers }),
        ]);

        categories = categoriesResponse.data;
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
                <h2>Erro ao carregar categorias</h2>
                <p>Verifique se a API está funcionando.</p>
            </div>
        );
    }

    return (
        <>
            <header className="page-header">
                <div>
                    <span className="breadcrumb">BIBLIOTECA / CADASTROS</span>
                    <h1>Categorias</h1>
                    <p>Organize os livros por categoria.</p>
                </div>
                <span className="live-status">
                    <span />
                    Conectado à API
                </span>
            </header>

            <section className="welcome-panel">
                <div>
                    <span>ORGANIZAÇÃO DO ACERVO</span>
                    <h2>Categorias da biblioteca</h2>
                    <p>Gerencie as categorias utilizadas na classificação dos livros.</p>
                </div>
                <div className="welcome-decoration">C</div>
            </section>

            <CategoryManager
                categories={categories}
                isAdmin={isAdmin}
            />
        </>
    );
}

export default function CategoriesPage() {
    return (
        <Suspense fallback={<div className="loading-panel">Carregando categorias...</div>}>
            <CategoriesContent />
        </Suspense>
    );
}
