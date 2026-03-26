import TabBar from '@/components/TabBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto pb-24 px-4">
        {children}
      </main>
      <TabBar />
    </div>
  )
}
