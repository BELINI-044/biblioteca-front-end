
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';
import publicApi from '@/lib/api';

type DashboardReport = {
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    activeLoans: number;
    overdueLoans: number;
    totalFines: number;
};

async function DashboardContent() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        redirect('/');
    }

    let report: DashboardReport;

    try {
        const response = await publicApi.get<DashboardReport>(
            '/reports/dashboard',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        report = response.data;
    } catch (error) {
        const status = axios.isAxiosError(error)
            ? error.response?.status
            : undefined;

        if (status === 401) {
            redirect('/');
        }

        if (status === 403) {
            return (
                <div className="error-panel">
                    <h2>Acesso restrito</h2>
                    <p>
                        O dashboard de relatórios está disponível
                        somente para administradores.
                    </p>
                </div>
            );
        }

        return (
            <div className="error-panel">
                <h2>Não foi possível carregar o dashboard</h2>
                <p>
                    Confira se a API está funcionando na porta 3000
                    e tente novamente.
                </p>
            </div>
        );
    }

    const stats = [
        {
            label: 'Livros cadastrados',
            value: report.totalBooks,
            icon: '▤',
            description: 'Títulos no catálogo',
            color: 'blue',
        },
        {
            label: 'Exemplares totais',
            value: report.totalCopies,
            icon: '▥',
            description: 'Unidades no acervo',
            color: 'purple',
        },
        {
            label: 'Disponíveis',
            value: report.availableCopies,
            icon: '✓',
            description: 'Prontos para empréstimo',
            color: 'green',
        },
        {
            label: 'Empréstimos ativos',
            value: report.activeLoans,
            icon: '⇄',
            description: 'Livros emprestados',
            color: 'orange',
        },
        {
            label: 'Em atraso',
            value: report.overdueLoans,
            icon: '◷',
            description: 'Precisam de atenção',
            color: 'red',
        },
        {
            label: 'Multas acumuladas',
            value: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(report.totalFines),
            icon: 'R$',
            description: 'Valor registrado no sistema',
            color: 'green',
        },
    ];

    return (
        <>
            <header className="page-header">
                <div>
                    <span className="breadcrumb">
                        BIBLIOTECA / VISÃO GERAL
                    </span>
                    <h1>Visão geral</h1>
                    <p>
                        Acompanhe os indicadores da sua biblioteca.
                    </p>
                </div>

                <div className="header-date">
                    <span>PAINEL ADMINISTRATIVO</span>
                    <strong>
                        {new Intl.DateTimeFormat('pt-BR', {
                            dateStyle: 'long',
                            timeZone: 'America/Sao_Paulo',
                        }).format(new Date())}
                    </strong>
                </div>
            </header>

            <section className="welcome-panel">
                <div>
                    <span>PAINEL DE CONTROLE</span>
                    <h2>Bem-vindo à sua biblioteca!</h2>
                    <p>
                        Aqui você acompanha o acervo, os empréstimos
                        e a situação geral da biblioteca.
                    </p>
                </div>

                <div className="welcome-decoration">B</div>
            </section>

            <section className="stats-section">
                <div className="section-heading">
                    <div>
                        <h2>Indicadores gerais</h2>
                        <p>Resumo atualizado dos dados do sistema.</p>
                    </div>
                    <span className="live-status">
                        <span />
                        Dados da API
                    </span>
                </div>

                <div className="stats-grid">
                    {stats.map((stat) => (
                        <article
                            key={stat.label}
                            className="stat-card"
                        >
                            <div className="stat-top">
                                <span>{stat.label}</span>
                                <div className={`stat-icon ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>

                            <strong className="stat-value">
                                {stat.value}
                            </strong>

                            <span className="stat-description">
                                {stat.description}
                            </span>
                        </article>
                    ))}
                </div>
            </section>

            <section className="bottom-panel">
                <div>
                    <span className="bottom-icon">▤</span>
                    <div>
                        <h3>Acervo da biblioteca</h3>
                        <p>
                            {report.availableCopies} de {report.totalCopies}
                            {' '}exemplares estão disponíveis.
                        </p>
                    </div>
                </div>

                <div className="availability-bar">
                    <div
                        style={{
                            width: report.totalCopies > 0
                                ? `${Math.min(100, Math.max(0, report.availableCopies / report.totalCopies * 100))}%`
                                : '0%',
                        }}
                    />
                </div>
            </section>

            <footer className="dashboard-footer">
                Sistema de Gestão de Biblioteca · Desenvolvido em ADS
            </footer>
        </>
    );
}

function DashboardSkeleton() {
    return (
        <div className="loading-panel">
            Carregando indicadores da biblioteca...
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}
