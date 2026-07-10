// src/pages/public/CampanhaPopupPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CampanhaPopupCard from "../../components/public/CampanhaPopupCard";

/**
 * Página de destino do Advertise pós-login do MikroTik (task 007, Parte C):
 * RouterOS redireciona o cliente já autenticado pra cá periodicamente,
 * passando `mikrotik_id`, `mac` e `orig` (URL original que o cliente estava
 * acessando, via $(link-orig-esc)). Sem "sequência"/timer — só dispensa e
 * volta pra navegação.
 */
export default function CampanhaPopupPage() {
  const [searchParams] = useSearchParams();
  const mikrotikId = searchParams.get("mikrotik_id");
  const orig = searchParams.get("orig");

  const [popup, setPopup] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mikrotikId) {
      setLoaded(true);
      return;
    }
    fetch(`/api/public/campanha/popup/mikrotik/${mikrotikId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.data?.item) setPopup(d.data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [mikrotikId]);

  const continuar = () => {
    window.location.href = orig ? decodeURIComponent(orig) : "/";
  };

  if (!loaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#12141c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {popup && <CampanhaPopupCard item={popup.item} />}
        <div className="p-4">
          <button
            onClick={continuar}
            className="w-full bg-green-500 text-black font-semibold py-3 rounded-full shadow hover:bg-green-400 active:bg-green-600 transition-colors"
          >
            Continuar navegando
          </button>
        </div>
      </div>
    </div>
  );
}
