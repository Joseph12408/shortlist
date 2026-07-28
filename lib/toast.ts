import { create } from "zustand";

export interface ToastItem {
    id: string;
    message: string;
    type: "error" | "success" | "info";
}

interface ToastState {
    toasts: ToastItem[];
    dismiss: (id: string) => void;
}

/**
 * Backs the <Toaster /> mounted once in the root layout. Exported so the
 * component can subscribe; use the `toast` helper below to push a message
 * from anywhere, including non-component code like the Zustand store.
 */
export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    dismiss: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

function push(message: string, type: ToastItem["type"], durationMs = 6000) {
    const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);

    useToastStore.setState((state) => ({
        toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => useToastStore.getState().dismiss(id), durationMs);
}

/**
 * User-facing notifications. Only ever pass messages written for users, never
 * raw caught errors, stack traces, or backend log text.
 */
export const toast = {
    error: (message: string) => push(message, "error"),
    success: (message: string) => push(message, "success"),
    info: (message: string) => push(message, "info"),
};
