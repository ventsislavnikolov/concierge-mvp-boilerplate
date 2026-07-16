import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getServerGreeting = createServerFn({ method: 'GET' }).handler(() => {
  return `Hello from the server at ${new Date().toISOString()}`
})

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await getServerGreeting(),
})

function Home() {
  const greeting = Route.useLoaderData()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="font-semibold text-2xl">concierge-mvp-boilerplate</h1>
      <p className="text-neutral-500">{greeting}</p>
    </main>
  )
}
