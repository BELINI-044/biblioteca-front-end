
'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import {
    createLoan,
    returnLoan,
    type LoanState,
} from '@/actions/loans';

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

export type Loan = {
    id: number;
    loanDate: string;
    dueDate: string;
    returnDate: string | null;
    status: 'ATIVO' | 'ATRASADO' | 'DEVOLVIDO';
    fine: number | string;
    Book?: { title: string };
    Reader?: { name: string };
    User?: { name: string };
};

function LoanForm({
    books,
    readers,
}: {
    books: Book[];
    readers: Reader[];
}) {
    const [state, formAction, pending] = useActionState<LoanState, FormData>(
        createLoan,
        { error: null, success: null }
    );

    const availableBooks = books.filter(
        book => book.availableCopies > 0
    );

    return (
        <section className="form-panel">
            <div className="section-heading">
                <div>
                    <h2>Novo empréstimo</h2>
                    <p>Selecione o livro e o leitor.</p>
                </div>
            </div>

            <form action={formAction} className="book-form">
                <div className="form-grid">
                    <label>
                        Livro disponível *
                        <select name="bookId" required defaultValue="">
                            <option value="" disabled>
                                Selecione um livro
                            </option>

                            {availableBooks.map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.title} — {book.availableCopies} disponível(is)
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Leitor *
                        <select name="readerId" required defaultValue="">
                            <option value="" disabled>
                                Selecione um leitor
                            </option>

                            {readers.map(reader => (
                                <option key={reader.id} value={reader.id}>
                                    {reader.name} — {reader.cpf}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {state.error && (
                    <p className="form-error">{state.error}</p>
                )}

                {state.success && (
                    <p className="form-success">{state.success}</p>
                )}

                <button
                    type="submit"
                    className="save-button"
                    disabled={pending || availableBooks.length === 0}
                >
                    {pending ? 'Registrando...' : 'Registrar empréstimo'}
                </button>

                {availableBooks.length === 0 && (
                    <p className="form-error">
                        Não existem exemplares disponíveis no momento.
                    </p>
                )}
            </form>
        </section>
    );
}

function ReturnForm({ loan }: { loan: Loan }) {
    const [state, formAction, pending] = useActionState<LoanState, FormData>(
        returnLoan,
        { error: null, success: null }
    );

    return (
        <div>
            <form action={formAction}>
                <input type="hidden" name="id" value={loan.id} />

                <button
                    type="submit"
                    className="reader-edit-button"
                    disabled={pending}
                >
                    {pending ? 'Devolvendo...' : 'Devolver'}
                </button>
            </form>

            {state.error && (
                <p className="form-error">{state.error}</p>
            )}

            {state.success && (
                <p className="form-success">{state.success}</p>
            )}
        </div>
    );
}

const statusLabel = {
    ATIVO: 'Ativo',
    ATRASADO: 'Atrasado',
    DEVOLVIDO: 'Devolvido',
};

function formatDate(value: string | null) {
    if (!value) return '—';

    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
}

function formatMoney(value: number | string) {
    return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

export default function LoanManager({
    loans,
    books,
    readers,
}: {
    loans: Loan[];
    books: Book[];
    readers: Reader[];
}) {
    const [filter, setFilter] = useState('TODOS');

    const filteredLoans = loans.filter(loan =>
        filter === 'TODOS' ? true : loan.status === filter
    );

    const activeCount = loans.filter(
        loan => loan.status === 'ATIVO'
    ).length;

    const overdueCount = loans.filter(
        loan => loan.status === 'ATRASADO'
    ).length;

    const returnedCount = loans.filter(
        loan => loan.status === 'DEVOLVIDO'
    ).length;

    return (
        <>
            <LoanForm books={books} readers={readers} />

            <section className="stats-grid loan-summary">
                <article className="stat-card">
                    <span>Ativos</span>
                    <strong className="stat-value">{activeCount}</strong>
                </article>

                <article className="stat-card">
                    <span>Em atraso</span>
                    <strong className="stat-value">{overdueCount}</strong>
                </article>

                <article className="stat-card">
                    <span>Devolvidos</span>
                    <strong className="stat-value">{returnedCount}</strong>
                </article>
            </section>

            <section className="stats-section">
                <div className="reader-toolbar">
                    <div>
                        <h2>Histórico de empréstimos</h2>
                        <p>{filteredLoans.length} registro(s)</p>
                    </div>

                    <select
                        className="loan-filter"
                        value={filter}
                        onChange={event => setFilter(event.target.value)}
                    >
                        <option value="TODOS">Todos</option>
                        <option value="ATIVO">Ativos</option>
                        <option value="ATRASADO">Em atraso</option>
                        <option value="DEVOLVIDO">Devolvidos</option>
                    </select>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Livro</th>
                                <th>Leitor</th>
                                <th>Empréstimo</th>
                                <th>Vencimento</th>
                                <th>Status</th>
                                <th>Multa</th>
                                <th>Ação</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredLoans.map(loan => (
                                <tr key={loan.id}>
                                    <td>
                                        <strong>{loan.Book?.title || '—'}</strong>
                                        <small>Empréstimo #{loan.id}</small>
                                    </td>

                                    <td>{loan.Reader?.name || '—'}</td>
                                    <td>{formatDate(loan.loanDate)}</td>
                                    <td>{formatDate(loan.dueDate)}</td>

                                    <td>
                                        <span className={`loan-status ${loan.status.toLowerCase()}`}>
                                            {statusLabel[loan.status]}
                                        </span>
                                    </td>

                                    <td>{formatMoney(loan.fine)}</td>

                                    <td>
                                        {loan.returnDate === null ? (
                                            <ReturnForm loan={loan} />
                                        ) : (
                                            <span className="returned-label">
                                                Devolvido em {formatDate(loan.returnDate)}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {filteredLoans.length === 0 && (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="empty-state">
                                            Nenhum empréstimo encontrado.
                                        </div>
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
