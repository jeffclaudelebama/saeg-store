import type { ReactNode } from 'react';
import Link from 'next/link';

export function PageShell({ title, subtitle, children, backHref }: { title: string; subtitle?: string; children: ReactNode; backHref?: string }) {
  return (
    <div className="page-shell">
      <header className="page-shell__header">
        <div className="container">
          <div className="page-shell__bar">
            {backHref ? (
              <Link href={backHref} className="icon-btn" aria-label="Retour">
                ←
              </Link>
            ) : (
              <div className="brand-pill">SAEG</div>
            )}
            <div className="brand-title-block">
              <p className="brand-overline">La Boutique</p>
              <h1>{title}</h1>
            </div>
          </div>
          {subtitle ? <p className="page-shell__subtitle">{subtitle}</p> : null}
        </div>
      </header>
      <main className="container page-shell__main">{children}</main>
    </div>
  );
}
