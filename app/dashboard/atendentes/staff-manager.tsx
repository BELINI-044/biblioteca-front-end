
'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import {
    saveStaff,
    toggleStaff,
    type StaffState,
} from '@/actions/staff';

export type Staff = {
    id: number;
    name: string;
    username: string;
    email: string;
    isAdmin: boolean;
    active: boolean;
};

function StaffForm({
    staff,
    onCancel,
}: {
    staff: Staff | null;
    onCancel: () => void;
}) {
    const [state, formAction, pending] = useActionState<StaffState, FormData>(
        saveStaff,
        { error: null, success: null }
    );

    return (
        <section className="form-panel">
            <div className="section-heading">
                <div>
                    <h2>{staff ? 'Editar atendente' : 'Novo atendente'}</h2>
                    <p>Informe os dados de acesso do funcionário.</p>
                </div>
            </div>

            <form action={formAction} className="book-form">
                {staff && (
                    <input type="hidden" name="id" value={staff.id} />
                )}

                <div className="form-grid">
                    <label>
                        Nome completo *
                        <input
                            name="name"
                            defaultValue={staff?.name || ''}
                            required
                        />
                    </label>

                    <label>
                        Nome de usuário *
                        <input
                            name="username"
                            defaultValue={staff?.username || ''}
                            required
                        />
                    </label>

                    <label>
                        E-mail *
                        <input
                            name="email"
                            type="email"
                            defaultValue={staff?.email || ''}
                            required
                        />
                    </label>

                    <label>
                        {staff ? 'Nova senha (opcional)' : 'Senha *'}
                        <input
                            name="password"
                            type="password"
                            minLength={6}
                            required={!staff}
                            placeholder={staff ? 'Deixe vazio para manter' : 'Mínimo de 6 caracteres'}
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
                        className="save-button"
                        disabled={pending}
                    >
                        {pending ? 'Salvando...' : 'Salvar atendente'}
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

function StaffStatusControl({ staff }: { staff: Staff }) {
    const [state, formAction, pending] = useActionState<StaffState, FormData>(
        toggleStaff,
        { error: null, success: null }
    );

    const nextActive = !staff.active;

    return (
        <div className="staff-status-control">
            <form action={formAction}>
                <input type="hidden" name="id" value={staff.id} />
                <input
                    type="hidden"
                    name="active"
                    value={String(nextActive)}
                />

                <button
                    className={staff.active ? 'deactivate-button' : 'activate-button'}
                    disabled={pending}
                    type="submit"
                >
                    {pending
                        ? 'Aguarde...'
                        : staff.active
                            ? 'Desativar'
                            : 'Reativar'}
                </button>
            </form>

            {state.error && (
                <span className="form-error">{state.error}</span>
            )}

            {state.success && (
                <span className="form-success">{state.success}</span>
            )}
        </div>
    );
}

export default function StaffManager({
    users,
}: {
    users: Staff[];
}) {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    const attendants = users.filter(user => !user.isAdmin);

    const filteredUsers = attendants.filter(user => {
        const term = search.toLocaleLowerCase('pt-BR');

        return (
            user.name.toLocaleLowerCase('pt-BR').includes(term) ||
            user.username.toLocaleLowerCase('pt-BR').includes(term) ||
            user.email.toLocaleLowerCase('pt-BR').includes(term)
        );
    });

    return (
        <>
            {showForm && (
                <StaffForm
                    key={editingStaff?.id ?? 'novo-atendente'}
                    staff={editingStaff}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <section className="stats-section">
                <div className="reader-toolbar">
                    <div>
                        <h2>Equipe de atendimento</h2>
                        <p>
                            {filteredUsers.length} atendente(s) encontrado(s)
                        </p>
                    </div>

                    <button
                        className="save-button"
                        onClick={() => {
                            setEditingStaff(null);
                            setShowForm(true);
                        }}
                    >
                        + Novo atendente
                    </button>
                </div>

                <div className="reader-search">
                    <span>⌕</span>
                    <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Pesquisar por nome, usuário ou e-mail..."
                    />
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Usuário</th>
                                <th>E-mail</th>
                                <th>Situação</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map(staff => (
                                <tr key={staff.id}>
                                    <td>
                                        <strong>{staff.name}</strong>
                                    </td>

                                    <td>{staff.username}</td>
                                    <td>{staff.email}</td>

                                    <td>
                                        <span className={
                                            staff.active
                                                ? 'staff-active'
                                                : 'staff-inactive'
                                        }>
                                            {staff.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="staff-actions">
                                            <button
                                                className="reader-edit-button"
                                                onClick={() => {
                                                    setEditingStaff(staff);
                                                    setShowForm(true);
                                                }}
                                            >
                                                Editar
                                            </button>

                                            <StaffStatusControl staff={staff} />
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            Nenhum atendente encontrado.
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
