import { MarketingScaffold } from '@/components/MarketingScaffold';
import { AccountOtpClient } from '@/components/AccountOtpClient';

export default function AccountOtpPage() {
  return (
    <MarketingScaffold whatsappMessage="Bonjour AGROPAG, je rencontre un souci sur le code OTP.">
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary">Connexion compte</h1>
          <p className="mt-2 text-slate-600">Vérifiez votre numéro pour accéder à votre espace client AGROPAG.</p>
        </div>
        <AccountOtpClient />
      </main>
    </MarketingScaffold>
  );
}
