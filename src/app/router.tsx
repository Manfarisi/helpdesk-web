import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminAuditPage } from '../pages/AdminAuditPage'
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage'
import { AdminSlaPage } from '../pages/AdminSlaPage'
import { AdminUsersPage } from '../pages/AdminUsersPage'
import { DashboardPage } from '../pages/DashboardPage'
import { EditArticlePage } from '../pages/EditArticlePage'
import { ErrorPage } from '../pages/ErrorPage'
import { KbArticlePage } from '../pages/KbArticlePage'
import { KnowledgeBasePage } from '../pages/KnowledgeBasePage'
import { LoginPage } from '../pages/LoginPage'
import { NewArticlePage } from '../pages/NewArticlePage'
import { NewTicketPage } from '../pages/NewTicketPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { TicketDetailPage } from '../pages/TicketDetailPage'
import { TicketsPage } from '../pages/TicketsPage'
import { AppLayout } from './AppLayout'
import { GuestOnly, RequireAuth, RequireRole } from './guards'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <GuestOnly />,
        children: [{ path: '/login', element: <LoginPage />, handle: { title: 'Masuk' } }],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to="/tickets" replace /> },
              { path: 'tickets', element: <TicketsPage />, handle: { title: 'Tiket' } },
              {
                path: 'tickets/new',
                element: <NewTicketPage />,
                handle: { title: 'Buat tiket' },
              },
              {
                path: 'tickets/:ticketId',
                element: <TicketDetailPage />,
                handle: { title: 'Detail tiket' },
              },
              { path: 'kb', element: <KnowledgeBasePage />, handle: { title: 'Knowledge Base' } },
              { path: 'kb/:slug', element: <KbArticlePage />, handle: { title: 'Artikel' } },
              {
                element: <RequireRole roles={['admin', 'agent']} />,
                children: [
                  {
                    path: 'kb/new',
                    element: <NewArticlePage />,
                    handle: { title: 'Tulis artikel' },
                  },
                  {
                    path: 'kb/:slug/edit',
                    element: <EditArticlePage />,
                    handle: { title: 'Edit artikel' },
                  },
                  { path: 'dashboard', element: <DashboardPage />, handle: { title: 'Dashboard' } },
                ],
              },
              {
                element: <RequireRole roles={['admin']} />,
                children: [
                  { path: 'admin', element: <Navigate to="/admin/users" replace /> },
                  {
                    path: 'admin/users',
                    element: <AdminUsersPage />,
                    handle: { title: 'Pengguna' },
                  },
                  {
                    path: 'admin/categories',
                    element: <AdminCategoriesPage />,
                    handle: { title: 'Kategori' },
                  },
                  { path: 'admin/sla', element: <AdminSlaPage />, handle: { title: 'Target SLA' } },
                  {
                    path: 'admin/audit',
                    element: <AdminAuditPage />,
                    handle: { title: 'Audit Log' },
                  },
                ],
              },
              {
                path: '*',
                element: <NotFoundPage />,
                handle: { title: 'Halaman tidak ditemukan' },
              },
            ],
          },
        ],
      },
    ],
  },
])