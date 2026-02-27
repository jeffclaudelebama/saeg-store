import Link from 'next/link';

export default function SplashPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary to-saeg-dark text-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
          <span className="material-symbols-outlined text-5xl">eco</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">SAEG</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">La Boutique</h1>
        <p className="mt-3 text-sm text-white/80">Invendus du marché éphémère • Vente au kilo • Livraison locale</p>
        <div className="mt-8 grid gap-3">
          <Link href="/onboarding" className="btn bg-white text-primary font-black">Commencer</Link>
          <Link href="/" className="btn border border-white/20 bg-white/5 text-white">Passer</Link>
        </div>
      </div>
    </main>
  );
}
