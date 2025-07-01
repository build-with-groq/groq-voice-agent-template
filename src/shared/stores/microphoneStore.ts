import { writable } from 'svelte/store';

export interface MicrophoneDevice {
  deviceId: string;
  label: string;
}

interface MicrophoneStoreState {
  devices: MicrophoneDevice[];
  selectedDeviceId: string | null;
}

function createMicrophoneStore() {
  const { subscribe, set, update } = writable<MicrophoneStoreState>({
    devices: [],
    selectedDeviceId: null,
  });

  return {
    subscribe,
    setDevices: (devices: MicrophoneDevice[]) =>
      update((state) => {
        // If the current selected device is not in the new list, reset selection
        const validSelected = devices.find((d) => d.deviceId === state.selectedDeviceId);
        return {
          devices,
          selectedDeviceId: validSelected ? state.selectedDeviceId : (devices[0]?.deviceId ?? null),
        };
      }),
    setSelectedDeviceId: (deviceId: string) =>
      update((state) => ({ ...state, selectedDeviceId: deviceId })),
    reset: () => set({ devices: [], selectedDeviceId: null }),
  };
}

export const microphoneStore = createMicrophoneStore(); 