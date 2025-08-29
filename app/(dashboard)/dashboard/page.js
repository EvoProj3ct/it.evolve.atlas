import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    return (
        <>
            <h1>Ora sei nella dashboard</h1>
            <p style={{ marginTop: '0.5rem' }}>
                Ciao, <strong>{session.user?.name}</strong> 👋
            </p>
        </>
    )
}
