type Listener = (error: any) => void;
const listeners = new Set<Listener>();

export const errorEmitter = {
  emit: (event: string, data: any) => {
    listeners.forEach(l => l(data));
  },
  on: (event: string, listener: Listener) => {
    listeners.add(listener);
  },
  off: (event: string, listener: Listener) => {
    listeners.delete(listener);
  }
};
