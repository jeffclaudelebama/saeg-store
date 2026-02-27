import Link from 'next/link';

export default function OnboardingPage() {
  const slides = [
    ['Vente au kilo', 'Choisissez votre poids avec un pas de 0,25 kg pour payer le juste prix.', 'balance'],
    ['Stocks limités', 'Les invendus du jour partent vite. Les quantités sont mises à jour en temps réel.', 'timer'],
    ['Livraison locale', 'Libreville, Akanda, Owendo + Click & Collect.', 'local_shipping'],
  ];

  return (
    <main className="min-h-screen bg-background-light px-4 py-10">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Onboarding</p>
          <h1 className="mt-2 text-3xl font-black text-primary">Bienvenue sur SAEG</h1>
        </div>
        {slides.map(([title, text, icon], idx) => (
          <section key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Étape {idx + 1}</p>
                <h2 className="text-lg font-black text-slate-900">{title}</h2>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
          </section>
        ))}
        <div className="grid gap-3 pt-2">
          <Link href="/installer" className="btn btn-primary">Installer la PWA</Link>
          <Link href="/" className="btn btn-ghost">Aller à l’accueil</Link>
        </div>
      </div>
    </main>
  );
}
