
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';
import publicApi from '@/lib/api';
import BookForm from './book-form';

type Book = {
    id: number;
    title: string;
    isbn: string;
    year: number | null;
    totalCopies: number;
    availableCopies: number;
    Category?: { name: string };
    Authors?: { id: number; name: string }[];
};

async function BooksContent() {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) redirect('/');

    let books: Book[] = [];
    let categories = [];
    let authors = [];
    let isAdmin = false;

    try {
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        const [bookResponse, categoryResponse, authorResponse, meResponse] =
            await Promise.all([
                publicApi.get('/books', { headers }),
                publicApi.get('/categories', { headers }),
                publicApi.get('/authors', { headers }),
                publicApi.get('/auth/me', { headers }),
            ]);

        books = bookResponse.data;
        categories = categoryResponse.data;
        authors = authorResponse.data;
        isAdmin = meResponse.data.user.isAdmin === true;

    } catch (error) {
        if (axios.isAxiosError(error) &&
            error.response?.status === 401) {
            redirect('/');
        }

        return (
            <div className="error-panel">
                <h2>Erro ao carregar o catálogo</h2>
                <p>Confira se a API está funcionando.</p>
            </div>
        );
    }

    return (
        <>
            <header className="page-header">
                <div>
                    <span className="breadcrumb">
                        BIBLIOTECA / ACERVO
                    </span>
                    <h1>Livros</h1>
                    <p>Gerencie o catálogo da biblioteca.</p>
                </div>
            </header>

            {isAdmin && (
                <BookForm
                    categories={categories}
                    authors={authors}
                />
            )}

            <section className="stats-section">
                <div className="section-heading">
                    <div>
                        <h2>Acervo cadastrado</h2>
                        <p>{books.length} título(s) encontrado(s)</p>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Autor(es)</th>
                                <th>Categoria</th>
                                <th>ISBN</th>
                                <th>Total</th>
                                <th>Disponíveis</th>
                            </tr>
                        </thead>

                        <tbody>
                            {books.map(book => (
                                <tr key={book.id}>
                                    <td>
                                        <strong>{book.title}</strong>
                                        <small>
                                            {book.year || 'Ano não informado'}
                                        </small>
                                    </td>

                                    <td>
                                        {book.Authors?.map(a => a.name).join(', ') || 'Sem autor'}
                                    </td>

                                    <td>
                                        {book.Category?.name || 'Sem categoria'}
                                    </td>

                                    <td>{book.isbn}</td>
                                    <td>{book.totalCopies}</td>
                                    <td>
                                        <span className={
                                            book.availableCopies > 0
                                                ? 'stock-available'
                                                : 'stock-empty'
                                        }>
                                            {book.availableCopies}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {books.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        Nenhum livro cadastrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}

export default function BooksPage() {
    return (
        <Suspense fallback={
            <div className="loading-panel">
                Carregando catálogo...
            </div>
        }>
            <BooksContent />
        </Suspense>
    );
}
