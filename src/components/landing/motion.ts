import { useEffect, useRef, useState } from 'react';

/**
 * Movimento controlado por scroll, sem dependências.
 * Regras: só `transform` e `opacity`; um único `requestAnimationFrame` por frame;
 * tudo desligado quando o utilizador pede menos movimento.
 */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

export function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFine(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return fine;
}

type Vars = { x?: number; y?: number };

/**
 * "Câmara" do hero: publica `--s` (0 → 1 conforme se faz scroll no primeiro ecrã)
 * e `--mx`/`--my` (posição do ponteiro, -1 → 1) para as camadas se moverem a
 * velocidades diferentes.
 */
export function useCamera<T extends HTMLElement>(ref: React.RefObject<T>, enabled: boolean) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    let vars: Vars = {};

    const write = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const height = Math.max(rect.height, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / height));
      element.style.setProperty('--s', progress.toFixed(4));
      if (typeof vars.x === 'number') {
        element.style.setProperty('--mx', vars.x.toFixed(3));
        element.style.setProperty('--my', (vars.y ?? 0).toFixed(3));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      vars = {
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      };
      schedule();
    };

    write();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    if (enabled) window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [ref, enabled]);
}

/**
 * Progresso de uma secção "pinada": 0 quando o topo encosta no topo do ecrã,
 * 1 quando o fim da secção chega ao fim do ecrã. Devolve o índice do acto activo.
 */
export function usePinnedStory<T extends HTMLElement>(ref: React.RefObject<T>, acts: number): number {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    let visible = true;

    const write = () => {
      frame = 0;
      if (!visible) return;
      const rect = element.getBoundingClientRect();
      const travel = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      element.style.setProperty('--p', progress.toFixed(4));
      const index = Math.min(acts - 1, Math.floor(progress * acts * 0.999));
      setActive((current) => (current === index ? current : index));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };

    const observer =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
            if (visible) schedule();
          })
        : null;
    observer?.observe(element);

    write();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, acts]);
  return active;
}

/** Marca o elemento com `data-inview` na primeira vez que entra no ecrã. */
export function useReveal<T extends HTMLElement>(ref: React.RefObject<T>): void {
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver !== 'function') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-inview', 'true');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
}

/** Publica `--x`/`--y` no cartão para o holofote seguir o ponteiro. */
export function useSpotlight<T extends HTMLElement>(ref: React.RefObject<T>): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      element.style.setProperty('--y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    };
    element.addEventListener('pointermove', onMove, { passive: true });
    return () => element.removeEventListener('pointermove', onMove);
  }, [ref]);
}

/** Atalho: ref + reveal. */
export function useRevealRef<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useReveal(ref);
  return ref;
}
