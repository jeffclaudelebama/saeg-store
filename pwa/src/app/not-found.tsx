import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background-light px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">AGROPAG</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Page introuvable</h1>
        <p className="mt-3 text-sm text-slate-600">Le lien demandé n’existe plus ou a été déplacé.</p>
        <Link href="/" className="btn btn-primary mt-6">
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
