import { createBrowserRouter, Navigate } from 'react-router-dom'
import { KnowledgeBasePage } from '../pages/KnowledgeBasePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { TicketsPage } from '../pages/TicketsPage'
import { AppLayout } from './AppLayout'
import { GuestOnly, RequireAuth, RequireRole } from './guards'
import { DashboardPage } from '../pages/DashboardPage'

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/tickets" replace /> },
          { path: 'tickets', element: <TicketsPage /> },
          { path: 'kb', element: <KnowledgeBasePage /> },
          {
            element: <RequireRole roles={['admin', 'agent']} />,
            children: [{ path: 'dashboard', element: <DashboardPage /> }],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])