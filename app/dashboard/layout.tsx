import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/actions/logout";

const menu = [
  { label: "Visão geral", icon: "▦", href: "/dashboard", active: true },
  { label: "Livros", icon: "▤", href: "/dashboard/livros", active: true },
  { label: "Autores", icon: "✎", href: "/dashboard/autores", active: true },
  {
    label: "Categorias",
    icon: "▧",
    href: "/dashboard/categorias",
    active: true,
  },
  { label: "Leitores", icon: "♙", href: "/dashboard/leitores", active: true },
  {
    label: "Empréstimos",
    icon: "⇄",
    href: "/dashboard/emprestimos",
    active: true,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <div className="brand-icon">B</div>
          <div>
            <strong>Biblioteca</strong>
            <span>Sistema de gestão</span>
          </div>
        </Link>

        <div className="nav-label">MENU PRINCIPAL</div>

        <nav className="sidebar-nav">
          {menu.map((item) =>
            item.active ? (
              <Link
                key={item.label}
                href={item.href}
                className="nav-item active"
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ) : (
              <div key={item.label} className="nav-item disabled">
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                <small>Em breve</small>
              </div>
            ),
          )}
        </nav>

        <div className="nav-label admin-label">ADMINISTRAÇÃO</div>

        <Link href="/dashboard/atendentes" className="nav-item">
          <span className="nav-icon">♙</span>
          <span>Atendentes</span>
        </Link>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="profile-avatar">A</div>
            <div>
              <strong>Administrador</strong>
              <span>Gestor da biblioteca</span>
            </div>
          </div>

          <form action={logout}>
            <button className="logout-button" type="submit">
              ↪ Sair do sistema
            </button>
          </form>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}
