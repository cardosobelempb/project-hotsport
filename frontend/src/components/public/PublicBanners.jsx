import React, { useEffect, useState, useCallback, useRef } from "react";
import { buildAdSrcDoc } from "../../utils/adsense";
import CampanhaPopupCard from "./CampanhaPopupCard";

const BAR_H = 90; // altura das faixas de banner (px)

function BannerContent({ banner }) {
  if (banner.tipo === "adsense") {
    return (
      <iframe
        key={banner.id}
        title="Publicidade"
        srcDoc={buildAdSrcDoc(banner)}
        className="w-full h-full"
        style={{ border: 0 }}
        scrolling="no"
      />
    );
  }
  const img = (
    <img
      src={banner.imagem_url}
      alt=""
      className="max-h-full max-w-full object-contain"
      draggable={false}
    />
  );
  return banner.link_destino ? (
    <a
      href={banner.link_destino}
      target="_blank"
      rel="noopener noreferrer"
      className="h-full w-full flex items-center justify-center"
    >
      {img}
    </a>
  ) : (
    img
  );
}

function Bar({ banner }) {
  return (
    <div
      className="w-full shrink-0 flex items-center justify-center bg-black/40"
      style={{ height: BAR_H }}
    >
      <div className="h-full w-full max-w-3xl flex items-center justify-center">
        <BannerContent banner={banner} />
      </div>
    </div>
  );
}

/**
 * Wrapper de layout das páginas públicas: renderiza o banner do topo e do
 * rodapé DENTRO do fluxo da página (acima e abaixo do conteúdo, sem
 * sobreposição). Um banner por posição (o ativo mais recente vence).
 *
 * Uso: substitui o div raiz da página —
 *   <PublicBanners pagina="lgpd" empresaId={empresaId}
 *     className="text-white bg-..." style={bgStyle}
 *     contentClassName="flex items-center justify-center px-4 py-8">
 *     ...conteúdo...
 *   </PublicBanners>
 *
 * `portalId` (opcional) liga o pop-up de campanha (item com modo_exibicao
 * = 'popup'), por cima do conteúdo. Itens de vídeo/YouTube são MANDATÓRIOS:
 * sem X, sem dispensa por clique no fundo, só libera (e só marca como visto
 * no sessionStorage) quando o vídeo termina — se o cliente sair no meio,
 * a próxima tentativa mostra o pop-up de novo do zero. Os demais tipos
 * (afiliado/cupom/adsense/imagem) continuam dispensáveis a qualquer momento,
 * 1x por sessão de navegador. `mikrotikId`/`mac` são opcionais, só usados
 * pra avaliar segmentação (dispositivo já é detectado aqui).
 */
export default function PublicBanners({
  pagina,
  empresaId,
  portalId,
  mikrotikId,
  className = "",
  style,
  contentClassName = "",
  children,
}) {
  const [banners, setBanners] = useState([]);
  const [popup, setPopup] = useState(null); // { campanha_id, item }
  const [popupAberto, setPopupAberto] = useState(false);
  const [popupConcluido, setPopupConcluido] = useState(false);
  const popupMandatorio = popup?.item?.tipo === "video" || popup?.item?.tipo === "youtube";

  useEffect(() => {
    if (!empresaId) return;
    fetch(`/api/public/banners?empresa_id=${encodeURIComponent(empresaId)}&pagina=${encodeURIComponent(pagina)}`)
      .then((r) => r.json())
      .then((d) => setBanners(Array.isArray(d?.data) ? d.data : []))
      .catch(() => {});
  }, [empresaId, pagina]);

  // Guarda a chave de sessionStorage do pop-up atual — só marcada como
  // "visto" na hora certa: imediatamente pra tipos dispensaveis, só ao
  // concluir o vídeo/YouTube pros mandatórios (ver handleConcluirVideo).
  const chaveVistoRef = useRef(null);

  useEffect(() => {
    if (!portalId && !mikrotikId) return;
    // Chave de sessão por portal quando disponível; cai pra mikrotik nas
    // páginas (como LoginHotspot) que só conhecem o mikrotik_id.
    const chaveVisto = `campanha_popup_shown_${portalId || `mtk_${mikrotikId}`}`;
    if (sessionStorage.getItem(chaveVisto)) return;

    const url = portalId
      ? `/api/public/campanha/${portalId}/popup?${new URLSearchParams(mikrotikId ? { mikrotik_id: mikrotikId } : {}).toString()}`
      : `/api/public/campanha/popup/mikrotik/${mikrotikId}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.data?.item) return;
        setPopup(d.data);
        setPopupAberto(true);
        setPopupConcluido(false);
        chaveVistoRef.current = chaveVisto;
        const mandatorio = d.data.item.tipo === "video" || d.data.item.tipo === "youtube";
        // Dispensável: marca como visto já, não aparece de novo nesta sessão.
        // Mandatório: só marca quando handleConcluirVideo rodar — se o
        // cliente sair antes, a próxima carga busca de novo do zero.
        if (!mandatorio) sessionStorage.setItem(chaveVisto, "1");
        if (portalId) {
          fetch(`/api/public/campanha/${portalId}/evento`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              campanha_id: d.data.campanha_id,
              item_id: d.data.item.id,
              tipo_evento: "impressao",
            }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, [portalId, mikrotikId]);

  const handleConcluirVideo = useCallback(() => {
    setPopupConcluido(true);
    if (chaveVistoRef.current) sessionStorage.setItem(chaveVistoRef.current, "1");
  }, []);

  const registrarClique = useCallback(() => {
    if (!popup || !portalId) return;
    fetch(`/api/public/campanha/${portalId}/evento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campanha_id: popup.campanha_id,
        item_id: popup.item.id,
        tipo_evento: "clique",
      }),
    }).catch(() => {});
  }, [popup, portalId]);

  const topo = banners.find((b) => b.posicao === "topo") || null;
  const rodape = banners.find((b) => b.posicao === "rodape") || null;

  return (
    <div className={`min-h-screen flex flex-col ${className}`} style={style}>
      {topo && <Bar banner={topo} />}
      <div className={`flex-1 ${contentClassName}`}>{children}</div>
      {rodape && <Bar banner={rodape} />}

      {popupAberto && popup && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${popupMandatorio ? "bg-black/95" : "bg-black/70"}`}
          onClick={popupMandatorio ? undefined : () => setPopupAberto(false)}
        >
          <div
            className="w-full max-w-sm bg-[#12141c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {!popupMandatorio && (
              <button
                onClick={() => setPopupAberto(false)}
                aria-label="Fechar"
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                ×
              </button>
            )}
            <CampanhaPopupCard
              item={popup.item}
              onClique={registrarClique}
              onConcluido={popupMandatorio ? handleConcluirVideo : undefined}
            />
            {popupMandatorio && (
              <div className="p-4">
                <button
                  onClick={() => setPopupAberto(false)}
                  disabled={!popupConcluido}
                  className="w-full bg-green-500 disabled:bg-white/10 disabled:text-gray-400 text-black font-semibold py-3 rounded-full shadow disabled:shadow-none hover:enabled:bg-green-400 active:enabled:bg-green-600 transition-colors disabled:cursor-not-allowed"
                >
                  {popupConcluido ? "Continuar" : "Assista para continuar"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
