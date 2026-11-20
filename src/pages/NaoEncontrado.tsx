import { Link } from 'react-router-dom';

export function NaoEncontrado() {
  return (
    <div className="rounded-2xl border border-dashed border-line p-8 text-center">
      <p className="text-lg font-semibold">Esta página não existe.</p>
      <Link to="/" className="btn-secundario mt-4">
        Voltar ao início
      </Link>
    </div>
  );
}
