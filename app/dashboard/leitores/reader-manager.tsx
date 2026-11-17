
'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { saveReader } from '@/actions/readers';

export type Reader = {
    id: number;
    name: string;
    cpf: string;
    email: string | null;
    phone: string | null;
};

function ReaderForm({
    reader,
    onCancel,
}: {
    reader?: Reader | null;
    onCancel: () => void;
}) {
    const [state, formAction, pending] = useActionState(
        saveReader,
        { error: null, success: null }
    );

    return (
        <section className="form-panel">
            <div className="section-heading">
                <div>
                    <h2>{reader ? 'Editar leitor' : 'Cadastrar leitor'}</h2>
                    <p>
                        Informe os dados do leitor da biblioteca.
                    </p>
                </div>
            </div>

            <form action={formAction} className="reader-form">
                {reader && (
                    <input
                        type="hidden"
                        name="id"
                        value={reader.id}
                    />
                )}

                <div className="form-grid">
                    <label>
                        Nome completo *
                        <input
                            name="name"
                            defaultValue={reader?.name || ''}
                            placeholder="Nome do leitor"
                            required
                        />
                    </label>

                    <label>
                        CPF *
                        <input
                            name="cpf"
                            defaultValue={reader?.cpf || ''}
                            placeholder="Digite o CPF"
                            required
                        />
                    </label>

                    <label>
                        E-mail
                        <input
                            name="email"
                            type="email"
                            defaultValue={reader?.email || ''}
                            placeholder="email@exemplo.com"
                        />
                    </label>

                    <label>
                        Telefone
                        <input
                            name="phone"
                            type="tel"
                            defaultValue={reader?.phone || ''}
                            placeholder="(44) 99999-9999"
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
                    <button
                        type="submit"
                        className="save-button"
                        disabled={pending}
                    >
                        {pending ? 'Salvando...' : 'Salvar leitor'}
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

export default function ReaderManager({
    readers,
}: {
    readers: Reader[];
}) {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingReader, setEditingReader] = useState<Reader | null>(null);

    const filteredReaders = readers.filter(reader => {
        const term = search.toLocaleLowerCase('pt-BR');

        return (
            reader.name.toLocaleLowerCase('pt-BR').includes(term) ||
            reader.cpf.includes(search) ||
            (reader.email || '').toLocaleLowerCase('pt-BR').includes(term)
        );
    });

    const openCreate = () => {
        setEditingReader(null);
        setShowForm(true);
    };

    const openEdit = (reader: Reader) => {
        setEditingReader(reader);
        setShowForm(true);
    };

    return (
        <>
            {showForm && (
                <ReaderForm
                    key={editingReader?.id ?? 'novo-leitor'}
                    reader={editingReader}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <section className="stats-section">
                <div className="reader-toolbar">
                    <div>
                        <h2>Leitores cadastrados</h2>
                        <p>
                            {filteredReaders.length} leitor(es) encontrado(s)
                        </p>
                    </div>

                    <button
                        className="save-button"
                        onClick={openCreate}
                    >
                        + Novo leitor
                    </button>
                </div>

                <div className="reader-search">
                    <span>⌕</span>
                    <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Pesquisar por nome, CPF ou e-mail..."
                    />
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>E-mail</th>
                                <th>Telefone</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredReaders.map(reader => (
                                <tr key={reader.id}>
                                    <td>
                                        <strong>{reader.name}</strong>
                                    </td>

                                    <td>{reader.cpf}</td>

                                    <td>
                                        {reader.email || 'Não informado'}
                                    </td>

                                    <td>
                                        {reader.phone || 'Não informado'}
                                    </td>

                                    <td>
                                        <button
                                            className="reader-edit-button"
                                            onClick={() => openEdit(reader)}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredReaders.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            Nenhum leitor encontrado.
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
