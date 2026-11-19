import { Outlet } from 'react-router-dom'
import { useRouteTitle } from './useRouteTitle'

/**
 * Pembungkus seluruh rute (termasuk halaman login), tempat judul tab diatur.
 */
export function RootLayout() {
  useRouteTitle()

  return <Outlet />
}