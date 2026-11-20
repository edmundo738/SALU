import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Painel } from './pages/Painel';
import { Notificacoes } from './pages/Notificacoes';
import { Confianca } from './pages/Confianca';
import { Seguranca } from './pages/Seguranca';
import { Entrar } from './pages/Entrar';
import { Explorar } from './pages/Explorar';
import { Pedidos } from './pages/Pedidos';
import { PedidoDetalhe } from './pages/PedidoDetalhe';
import { PublicarPedido } from './pages/PublicarPedido';
import { PublicarPerfil } from './pages/PublicarPerfil';
import { PerfilPublico } from './pages/PerfilPublico';
import { Planos } from './pages/Planos';
import { Interno } from './pages/Interno';
import { NaoEncontrado } from './pages/NaoEncontrado';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="entrar" element={<Entrar />} />

        {/* Lado da oferta */}
        <Route path="explorar" element={<Explorar />} />
        <Route path="perfil/novo" element={<PublicarPerfil />} />
        <Route path="perfil/:id" element={<PerfilPublico />} />

        {/* Lado da procura */}
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="pedidos/:id" element={<PedidoDetalhe />} />
        <Route path="publicar-pedido" element={<PublicarPedido />} />

        <Route path="painel" element={<Painel />} />
        <Route path="notificacoes" element={<Notificacoes />} />
        <Route path="confianca" element={<Confianca />} />
        <Route path="seguranca" element={<Seguranca />} />
        <Route path="minha-area" element={<Navigate to="/painel" replace />} />
        <Route path="planos" element={<Planos />} />
        <Route path="interno" element={<Interno />} />
        <Route path="*" element={<NaoEncontrado />} />
      </Route>
    </Routes>
  );
}
