import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Alert from "../components/ui/alert/Alert";

type AlertVariant = "success" | "error" | "warning" | "info";

type AppAlertPayload = {
  variant: AlertVariant;
  title: string;
  message: string;
  durationMs?: number;
};

type AppAlertContextType = {
  showAlert: (payload: AppAlertPayload) => void;
};

type ActiveAlert = AppAlertPayload & {
  id: number;
};

const AppAlertContext = createContext<AppAlertContextType | undefined>(undefined);

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const dismissAlert = useCallback(() => {
    setIsVisible(false);
    window.setTimeout(() => {
      setActiveAlert(null);
    }, 300);
  }, []);

  const showAlert = useCallback((payload: AppAlertPayload) => {
    setActiveAlert({
      ...payload,
      id: Date.now(),
    });
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!activeAlert) {
      return;
    }

    const displayDuration = activeAlert.durationMs ?? 3000;
    const fadeTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, Math.max(displayDuration - 500, 0));

    const clearTimer = window.setTimeout(() => {
      setActiveAlert(null);
    }, displayDuration);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [activeAlert]);

  const contextValue = useMemo<AppAlertContextType>(
    () => ({
      showAlert,
    }),
    [showAlert],
  );

  return (
    <AppAlertContext.Provider value={contextValue}>
      {children}
      {activeAlert ? (
        <div
          className={`fixed bottom-6 right-6 z-[100000] w-full max-w-sm transition-all duration-500 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0 pointer-events-none"
          }`}
        >
          <div className="relative">
            <button
              type="button"
              onClick={dismissAlert}
              className="absolute right-2 top-2 z-10 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Close
            </button>
          </div>
          <Alert
            variant={activeAlert.variant}
            title={activeAlert.title}
            message={activeAlert.message}
          />
        </div>
      ) : null}
    </AppAlertContext.Provider>
  );
}

export function useAppAlert() {
  const context = useContext(AppAlertContext);
  if (!context) {
    throw new Error("useAppAlert must be used within AppAlertProvider.");
  }
  return context;
}

