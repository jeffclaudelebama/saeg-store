export default function Loading() {
  return (
    <main className="min-h-screen bg-background-light px-4 py-16">
      <div className="mx-auto max-w-4xl animate-pulse space-y-4">
        <div className="h-10 w-64 rounded bg-slate-200" />
        <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-white border border-slate-200" />
          ))}
        </div>
      </div>
    </main>
  );
}
