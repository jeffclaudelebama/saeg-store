import Link from 'next/link';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background-light px-4 py-16 flex items-center justify-center">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined">wifi_off</span>
        </div>
        <h1 className="mt-4 text-2xl font-black text-slate-900">Vous êtes hors ligne</h1>
        <p className="mt-2 text-sm text-slate-600">Le catalogue récemment consulté peut rester disponible. Reconnectez-vous pour valider le panier et passer commande.</p>
        <Link href="/catalogue" className="btn btn-primary mt-6">Voir le catalogue</Link>
      </div>
    </main>
  );
}
