/**
 * Home Page - Minimal Working Version
 */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-6">AGROPAG La Boutique</h1>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="inline-flex gap-2 badge-terroir text-xs uppercase tracking-[0.35em] font-semibold">
            AGROPAG • Société agropastorale du Gabon
          </div>
          <h2 className="text-2xl font-semibold">Bienvenue!</h2>
          <p className="text-slate-600">
            Marketplace mobile-first des invendus des marchés éphémères, disponibles au kilo ou à l’unité.
          </p>
          <div className="flex flex-wrap gap-3">
            <a 
              href="/boutique" 
              className="px-6 py-3 bg-[#1B7F3A] text-white rounded-lg hover:bg-[#175c2b] transition-colors font-semibold"
            >
              Voir la Boutique
            </a>
            <a 
              href="https://wa.me/24162560462?text=Bonjour%20AGROPAG,%20je%20souhaite%20commander" 
              className="btn-earth px-6 py-3 flex items-center gap-2 rounded-lg"
              target="_blank"
              rel="noreferrer"
            >
              Commander sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
