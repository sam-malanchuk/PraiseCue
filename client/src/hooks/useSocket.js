// Deprecated: useAppContext provides socket access.
import { useAppContext } from '../context/AppContext';

/**
 * Hook: useSocket
 * @deprecated Use useAppContext().socket instead
 */
export function useSocket() {
  const { socket } = useAppContext();
  return socket;
}
