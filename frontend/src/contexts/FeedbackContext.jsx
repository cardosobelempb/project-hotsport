import { createContext, useContext, useState, useRef, useCallback, useMemo } from "react";
import { XCircle, CheckCircle2, Info, AlertTriangle, HelpCircle } from "lucide-react";
import { Modal, Button } from "../components/ui";

const FeedbackContext = createContext(null);

const MESSAGE_VARIANTS = {
  error: { icon: XCircle, iconClassName: "text-red-400", title: "Erro" },
  success: { icon: CheckCircle2, iconClassName: "text-green-400", title: "Sucesso" },
  info: { icon: Info, iconClassName: "text-blue-400", title: "Aviso" },
};

function MessageBody({ message }) {
  if (Array.isArray(message)) {
    return (
      <div className="space-y-2">
        {message.map((linha, i) => (
          <div key={i} className="text-sm text-gray-300 px-3 py-2 rounded bg-white/5">
            {linha}
          </div>
        ))}
      </div>
    );
  }
  return <p className="text-sm text-gray-300 whitespace-pre-line">{message}</p>;
}

export function FeedbackProvider({ children }) {
  const [msg, setMsg] = useState(null); // { variant, title, message }
  const [confirmState, setConfirmState] = useState(null); // { title, message, confirmText, cancelText, danger }
  const resolverRef = useRef(null);

  const show = useCallback((variant, message, opts) => {
    setMsg({
      variant,
      title: opts?.title ?? MESSAGE_VARIANTS[variant].title,
      message,
    });
  }, []);

  const showError = useCallback((message, opts) => show("error", message, opts), [show]);
  const showSuccess = useCallback((message, opts) => show("success", message, opts), [show]);
  const showInfo = useCallback((message, opts) => show("info", message, opts), [show]);

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      // Se ja existe um confirm pendente, resolve como cancelado
      resolverRef.current?.(false);
      resolverRef.current = resolve;
      setConfirmState({
        title: opts.title ?? "Confirmar ação",
        message: opts.message ?? "",
        confirmText: opts.confirmText ?? "Confirmar",
        cancelText: opts.cancelText ?? "Cancelar",
        danger: !!opts.danger,
      });
    });
  }, []);

  const closeMsg = useCallback(() => setMsg(null), []);

  const decide = useCallback((valor) => {
    resolverRef.current?.(valor);
    resolverRef.current = null;
    setConfirmState(null);
  }, []);

  const value = useMemo(
    () => ({ showError, showSuccess, showInfo, confirm }),
    [showError, showSuccess, showInfo, confirm]
  );

  const msgVariant = msg ? MESSAGE_VARIANTS[msg.variant] : null;

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {/* Modal de mensagem (erro/sucesso/aviso) */}
      <Modal
        open={!!msg}
        onClose={closeMsg}
        title={msg?.title}
        icon={msgVariant?.icon}
        iconClassName={msgVariant?.iconClassName}
        footer={<Button onClick={closeMsg}>OK</Button>}
      >
        {msg && <MessageBody message={msg.message} />}
      </Modal>

      {/* Modal de confirmacao */}
      <Modal
        open={!!confirmState}
        onClose={() => decide(false)}
        closeOnBackdrop={false}
        title={confirmState?.title}
        icon={confirmState?.danger ? AlertTriangle : HelpCircle}
        iconClassName={confirmState?.danger ? "text-red-400" : "text-blue-400"}
        footer={
          <>
            <Button variant="secondary" onClick={() => decide(false)}>
              {confirmState?.cancelText}
            </Button>
            <Button variant={confirmState?.danger ? "danger" : "primary"} onClick={() => decide(true)}>
              {confirmState?.confirmText}
            </Button>
          </>
        }
      >
        {confirmState && <MessageBody message={confirmState.message} />}
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback deve ser usado dentro de FeedbackProvider");
  }
  return context;
}
