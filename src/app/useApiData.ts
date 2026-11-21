import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../lib/api';

interface State<T> {
  data: T | null;
  error: string | null;
  status: number | null;
  loading: boolean;
}

export function useApiData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, status: null, loading: true });
  const [version, setVersion] = useState(0);
  const loadedRef = useRef(false);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    loaderRef
      .current()
      .then((data) => {
        if (!active) return;
        setState({ data, error: null, status: 200, loading: false });
        loadedRef.current = true;
      })
      .catch((error: unknown) => {
        if (!active) return;
        const apiError = error instanceof ApiError ? error : null;
        setState({
          data: null,
          error: apiError?.message || 'UNKNOWN',
          status: apiError?.status ?? null,
          loading: false,
        });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload, loaded: loadedRef.current };
}
