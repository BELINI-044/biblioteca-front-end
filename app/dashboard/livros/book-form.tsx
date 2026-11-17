
'use client';

import { useActionState } from 'react';
import { createBook } from '@/actions/books';

type Category = {
    id: number;
    name: string;
};

type Author = {
    id: number;
    name: string;
};

export default function BookForm({
    categories,
    authors,
}: {
    categories: Category[];
    authors: Author[];
}) {
    const [state, formAction, pending] = useActionState(
        createBook,
        { error: null, success: null }
    );

    return (
        <section className="form-panel">
            <div className="section-heading">
                <div>
                    <h2>Cadastrar novo livro</h2>
                    <p>Preencha os dados para adicionar ao acervo.</p>
                </div>
            </div>

            <form action={formAction} className="book-form">
                <div className="form-grid">
                    <label>
                        Título *
                        <input
                            name="title"
                            placeholder="Ex.: Dom Casmurro"
                            required
                        />
                    </label>

                    <label>
                        ISBN *
                        <input
                            name="isbn"
                            placeholder="Ex.: 9788535910663"
                            required
                        />
                    </label>

                    <label>
                        Ano de publicação
                        <input
                            name="year"
                            type="number"
                            min="0"
                            placeholder="Ex.: 1899"
                        />
                    </label>

                    <label>
                        Quantidade de exemplares *
                        <input
                            name="totalCopies"
                            type="number"
                            min="1"
                            defaultValue="1"
                            required
                        />
                    </label>

                    <label>
                        Categoria *
                        <select name="categoryId" required defaultValue="">
                            <option value="" disabled>
                                Selecione uma categoria
                            </option>

                            {categories.map(category => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="author-selection">
                    <strong>Autores</strong>

                    {authors.length === 0 ? (
                        <p>Nenhum autor cadastrado.</p>
                    ) : (
                        <div className="author-options">
                            {authors.map(author => (
                                <label key={author.id}>
                                    <input
                                        type="checkbox"
                                        name="authorIds"
                                        value={author.id}
                                    />
                                    {author.name}
                                </label>
                            ))}
                        </div>
                    )}
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
                    disabled={pending}
                >
                    {pending ? 'Salvando...' : 'Cadastrar livro'}
                </button>
            </form>
        </section>
    );
}
