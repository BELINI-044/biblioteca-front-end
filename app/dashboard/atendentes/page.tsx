
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';
import publicApi from '@/lib/api';
import StaffManager, { type Staff } from './staff-manager';

async function StaffContent() {
    const token = (await cookies()).get('accessToken')?.value;

    if (!token) redirect('/');

    let users: Staff[] = [];
    let errorStatus = 0;
    let isAdmin = false;

    try {
        const headers = { Authorization: `Bearer ${token}` };

        const [usersResponse, meResponse] = await Promise.all([
            publicApi.get<Staff[]>('/user', { headers }),
            publicApi.get('/auth/me', { headers }),
        ]);

        users = usersResponse.data;
        isAdmin = meResponse.data.user.isAdmin === true;
    } catch (error) {
        errorStatus = axios.isAxiosError(error)
            ? error.response?.status || 500
            : 500;
    }

    if (errorStatus === 401) redirect('/');

    if (errorStatus === 403 || (!isAdmin && errorStatus === 0)) {
        redirect('/dashboard');
    }

    if (errorStatus !== 0) {
        return (
            <div className="error-panel">
                <h2>Erro ao carregar atendentes</h2>
                <p>Verifique a conexão com a API.</p>
            </div>
        );
    }

    return (
        <>
            <header className="page-header">
                <div>
                    <span className="breadcrumb">BIBLIOTECA / ADMINISTRAÇÃO</span>
                    <h1>Atendentes</h1>
                    <p>Gerencie os usuários com acesso ao sistema.</p>
                </div>
                <span className="live-status">
                    <span />
                    Conectado à API
                </span>
            </header>

            <section className="welcome-panel">
                <div>
                    <span>GESTÃO DE EQUIPE</span>
                    <h2>Equipe da biblioteca</h2>
                    <p>
                        Cadastre funcionários, atualize seus dados
                        e controle as permissões de acesso.
                    </p>
                </div>
                <div className="welcome-decoration">A</div>
            </section>

            <StaffManager users={users} />
        </>
    );
}

export default function StaffPage() {
    return (
        <Suspense fallback={<div className="loading-panel">Carregando equipe...</div>}>
            <StaffContent />
        </Suspense>
    );
}
