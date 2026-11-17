
'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { saveAuthor } from '@/actions/authors';

export type Author = {
    id: number;
    name: string;
    nationality: string | null;
    birthDate: string | null;
};

function AuthorForm({
    author,
    onCancel,
}: {
    author: Author | null;
    onCancel: () => void;
}) {
    const [state, formAction, pending] = useActionState(
        saveAuthor,
        { error: null, success: null }
    );

    return (
        <section className="form-panel">
            <div className="section-heading">
                <div>
                    <h2>{author ? 'Editar autor' : 'Cadastrar autor'}</h2>
                    <p>Informe os dados do autor.</p>
                </div>
            </div>

            <form action={formAction} className="book-form">
                {author && (
                    <input type="hidden" name="id" value={author.id} />
                )}

                <div className="form-grid">
                    <label>
                        Nome completo *
                        <input
                            name="name"
                            defaultValue={author?.name || ''}
                            placeholder="Nome do autor"
                            required
                        />
                    </label>

                    <label>
                        Nacionalidade
                        <input
                            name="nationality"
                            defaultValue={author?.nationality || ''}
                            placeholder="Ex.: Brasileira"
                        />
                    </label>

                    <label>
                        Data de nascimento
                        <input
                            name="birthDate"
                            type="date"
                            defaultValue={author?.birthDate || ''}
                        />
                    </label>
                </div>

                {state.error && (
                    <p className="form-error">{state.error}</p>
                )}

                {state.success && (
                    <p className="form-success">{state.success}</p>
                )}

                <div className="reader-form-actions">
                    <button className="save-button" disabled={pending}>
                        {pending ? 'Salvando...' : 'Salvar autor'}
                    </button>

                    <button
                        type="button"
                        className="cancel-button"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </section>
    );
}

export default function AuthorManager({
    authors,
    isAdmin,
}: {
    authors: Author[];
    isAdmin: boolean;
}) {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

    const filteredAuthors = authors.filter(author => {
        const term = search.toLocaleLowerCase('pt-BR');

        return (
            author.name.toLocaleLowerCase('pt-BR').includes(term) ||
            (author.nationality || '').toLocaleLowerCase('pt-BR').includes(term)
        );
    });

    return (
        <>
            {showForm && isAdmin && (
                <AuthorForm
                    key={editingAuthor?.id ?? 'novo-autor'}
                    author={editingAuthor}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <section className="stats-section">
                <div className="reader-toolbar">
                    <div>
                        <h2>Autores cadastrados</h2>
                        <p>{filteredAuthors.length} autor(es) encontrado(s)</p>
                    </div>

                    {isAdmin && (
                        <button
                            className="save-button"
                            onClick={() => {
                                setEditingAuthor(null);
                                setShowForm(true);
                            }}
                        >
                            + Novo autor
                        </button>
                    )}
                </div>

                <div className="reader-search">
                    <span>⌕</span>
                    <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Pesquisar por nome ou nacionalidade..."
                    />
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Nacionalidade</th>
                                <th>Data de nascimento</th>
                                {isAdmin && <th>Ações</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAuthors.map(author => (
                                <tr key={author.id}>
                                    <td><strong>{author.name}</strong></td>
                                    <td>{author.nationality || 'Não informada'}</td>
                                    <td>{author.birthDate || 'Não informada'}</td>
                                    {isAdmin && (
                                        <td>
                                            <button
                                                className="reader-edit-button"
                                                onClick={() => {
                                                    setEditingAuthor(author);
                                                    setShowForm(true);
                                                }}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {filteredAuthors.length === 0 && (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3}>
                                        <div className="empty-state">
                                            Nenhum autor encontrado.
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
    