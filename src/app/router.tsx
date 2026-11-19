import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardPage } from '../pages/DashboardPage'
import { EditArticlePage } from '../pages/EditArticlePage'
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
          { path: 'tickets/new', element: <NewTicketPage /> },
          { path: 'tickets/:ticketId', element: <TicketDetailPage /> },
          { path: 'kb', element: <KnowledgeBasePage /> },
          { path: 'kb/:slug', element: <KbArticlePage /> },
          {
            element: <RequireRole roles={['admin', 'agent']} />,
            children: [
              { path: 'kb/new', element: <NewArticlePage /> },
              { path: 'kb/:slug/edit', element: <EditArticlePage /> },
              { path: 'dashboard', element: <DashboardPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])