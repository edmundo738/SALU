import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Encontrar } from './pages/Encontrar';
import { Publicar } from './pages/Publicar';
import { PerfilPublico } from './pages/PerfilPublico';
import { Interno } from './pages/Interno';
import { NaoEncontrado } from './pages/NaoEncontrado';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Encontrar />} />
        <Route path="publicar" element={<Publicar />} />
        <Route path="perfil/:id" element={<PerfilPublico />} />
        <Route path="interno" element={<Interno />} />
        <Route path="*" element={<NaoEncontrado />} />
      </Route>
    </Routes>
  );
}
