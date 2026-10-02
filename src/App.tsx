import type { MountContext } from './shell-contract';

/** The barbershop domain app. Its screens arrive in the next pull requests. */
export function App({ context }: { context: MountContext }) {
  return (
    <main style={{ padding: '1rem' }}>
      <h1>Barberías</h1>
      <p>{context.basePath}</p>
    </main>
  );
}
