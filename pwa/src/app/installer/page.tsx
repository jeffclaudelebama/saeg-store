import Link from 'next/link';

export default function InstallerPage() {
  return (
    <main className="min-h-screen bg-background-light px-4 py-10">
      <div className="mx-auto max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Android</p>
          <h1 className="mt-2 text-2xl font-black text-primary">Installation en 1 clic</h1>
          <p className="mt-3 text-sm text-slate-600">Quand la bannière s’affiche, appuyez sur “Installer”. L’application sera ajoutée à l’écran d’accueil.</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li className="flex gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span><span>Fonctionne sur Chrome/Edge Android</span></li>
            <li className="flex gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span><span>Accès rapide et expérience plein écran</span></li>
          </ul>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/70">iPhone / iPad (Safari)</p>
          <h2 className="mt-2 text-2xl font-black text-primary">Ajouter à l’écran d’accueil</h2>
          <ol className="mt-4 list-decimal pl-5 space-y-3 text-sm text-slate-600">
            <li>Ouvrir AGROPAG La Boutique dans Safari</li>
            <li>Appuyer sur <strong>Partager</strong></li>
            <li>Choisir <strong>Sur l’écran d’accueil</strong></li>
            <li>Valider avec <strong>Ajouter</strong></li>
          </ol>
        </section>
      </div>
      <div className="mx-auto max-w-3xl mt-6 flex gap-3">
        <Link href="/" className="btn btn-primary">Retour accueil</Link>
        <Link href="/onboarding" className="btn btn-ghost">Onboarding</Link>
      </div>
    </main>
  );
}
