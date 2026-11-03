import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import ToastContext from "./toastContext";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timerRefs = useRef(new Map());

  const removeToast = useCallback((id) => {
    if (timerRefs.current.has(id)) {
      clearTimeout(timerRefs.current.get(id));
      timerRefs.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, link = "/cart", linkText = "View Cart", duration = 3500 }) => {
      const id = `${performance.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast = { id, title, message, link, linkText };

      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);

      timerRefs.current.set(id, timer);
      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-5 right-5 z-[120] flex max-w-sm flex-col gap-2.5 sm:bottom-6 sm:right-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-center justify-between gap-4 rounded-xl border border-[#d4af37]/40 bg-[#141416]/95 p-4 text-[#f5f1e8] shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#d4af37] text-sm font-bold">
                ✓
              </span>
              <div className="text-xs">
                {toast.title && <p className="font-semibold text-[#d4af37]">{toast.title}</p>}
                <p className="mt-0.5 text-gray-200">{toast.message}</p>
                {toast.link && (
                  <Link
                    to={toast.link}
                    onClick={() => removeToast(toast.id)}
                    className="mt-1.5 inline-block text-[11px] font-bold tracking-wider text-[#d4af37] underline decoration-[#d4af37]/60 underline-offset-2 hover:text-[#f5f1e8]"
                  >
                    {toast.linkText} →
                  </Link>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-gray-400 hover:text-white text-base leading-none p-1 transition"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
