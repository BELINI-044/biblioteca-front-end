
'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import {
    saveCategory,
    deleteCategory,
} from '@/actions/categories';

export type Category = {
    id: number;
    name: string;
    description: string | null;
};

function CategoryForm({
    category,
    onCancel,
}: {
    category: Category | null;
    onCancel: () => void;
}) {
    const [state, formAction, pending] = useActionState(
        saveCategory,
        { error: null, success: null }
    );

    return (
        <section className="form-panel">
            <div className="section-heading">
                <div>
                    <h2>{category ? 'Editar categoria' : 'Nova categoria'}</h2>
                    <p>Informe os dados da categoria.</p>
                </div>
            </div>

            <form action={formAction} className="book-form">
                {category && (
                    <input type="hidden" name="id" value={category.id} />
                )}

                <div className="form-grid">
                    <label>
                        Nome da categoria *
                        <input
                            name="name"
                            defaultValue={category?.name || ''}
                            placeholder="Ex.: Romance"
                            required
                        />
                    </label>

                    <label>
                        Descrição
                        <input
                            name="description"
                            defaultValue={category?.description || ''}
                            placeholder="Descrição da categoria"
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
                        {pending ? 'Salvando...' : 'Salvar categoria'}
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

export default function CategoryManager({
    categories,
    isAdmin,
}: {
    categories: Category[];
    isAdmin: boolean;
}) {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);

    const filteredCategories = categories.filter(category => {
        const term = search.toLocaleLowerCase('pt-BR');

        return (
            category.name.toLocaleLowerCase('pt-BR').includes(term) ||
            (category.description || '').toLocaleLowerCase('pt-BR').includes(term)
        );
    });

    return (
        <>
            {showForm && isAdmin && (
                <CategoryForm
                    key={editingCategory?.id ?? 'nova-categoria'}
                    category={editingCategory}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <section className="stats-section">
                <div className="reader-toolbar">
                    <div>
                        <h2>Categorias cadastradas</h2>
                        <p>
                            {filteredCategories.length} categoria(s) encontrada(s)
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            className="save-button"
                            onClick={() => {
                                setEditingCategory(null);
                                setShowForm(true);
                            }}
                        >
                            + Nova categoria
                        </button>
                    )}
                </div>

                <div className="reader-search">
                    <span>⌕</span>
                    <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Pesquisar categoria..."
                    />
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Descrição</th>
                                {isAdmin && <th>Ações</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCategories.map(category => (
                                <tr key={category.id}>
                                    <td><strong>{category.name}</strong></td>
                                    <td>{category.description || 'Sem descrição'}</td>

                                    {isAdmin && (
                                        <td>
                                            <div className="category-actions">
                                                <button
                                                    className="reader-edit-button"
                                                    onClick={() => {
                                                        setEditingCategory(category);
                                                        setShowForm(true);
                                                    }}
                                                >
                                                    Editar
                                                </button>

                                                <form
                                                    action={deleteCategory}
                                                    onSubmit={event => {
                                                        if (!window.confirm(
                                                            `Deseja excluir a categoria "${category.name}"?`
                                                        )) {
                                                            event.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="id"
                                                        value={category.id}
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="delete-button"
                                                    >
                                                        Excluir
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {filteredCategories.length === 0 && (
                                <tr>
                                    <td colSpan={isAdmin ? 3 : 2}>
                                        <div className="empty-state">
                                            Nenhuma categoria encontrada.
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
