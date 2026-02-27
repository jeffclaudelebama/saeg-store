export function LoadingState({ label = 'Chargement...' }: { label?: string }) {
  return <div className="state-card state-card--loading">{label}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-card state-card--error">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
