import { redirect } from 'next/navigation'

/**
 * Root route — always redirects to /search (the main explorer view).
 * The marketing landing page is available at /about.
 */
export default function RootPage() {
  redirect('/search')
}
