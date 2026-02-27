'use client';

import { usePwaInstallPrompt } from '@/hooks/usePwaInstallPrompt';

export function InstallPwaPrompt() {
  const prompt = usePwaInstallPrompt();

  if (!prompt.visible || prompt.mode === 'hidden') return null;

  return (
    <div className="install-banner" role="dialog" aria-label="Installer la PWA SAEG">
      <div className="install-banner__content">
        <div>
          <p className="install-banner__eyebrow">Installation rapide</p>
          <h3 className="install-banner__title">Installer SAEG – La Boutique</h3>
          <p className="install-banner__text">
            Accès plus rapide, écran d’accueil, expérience mobile optimisée.
          </p>
          {prompt.mode === 'ios' ? (
            <button type="button" className="link-btn" onClick={prompt.openIosHelp}>
              Voir les étapes iPhone/iPad
            </button>
          ) : null}
          {prompt.mode === 'ios' && prompt.iosHelpOpen ? (
            <ol className="install-banner__steps">
              <li>Appuyer sur Partager dans Safari</li>
              <li>Choisir “Sur l’écran d’accueil”</li>
              <li>Valider “Ajouter”</li>
            </ol>
          ) : null}
        </div>
        <div className="install-banner__actions">
          {prompt.mode === 'android' ? (
            <button type="button" className="btn btn-primary" onClick={() => void prompt.promptInstall()}>
              Installer
            </button>
          ) : (
            <a href="/installer" className="btn btn-primary">
              Guide iPhone
            </a>
          )}
          <button type="button" className="btn btn-ghost" onClick={prompt.dismiss}>
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
