import OverviewClient from './OverviewClient'

export const metadata = {
  title: 'Overview',
}

// Temporarily keep the overview page minimal to avoid build issues
export default function OverviewPage() {
  return <OverviewClient />
}

