// src/pages/public/CampanhaPlayer.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Volume2, VolumeX, Ticket } from "lucide-react";
import { redirecionarHotspot } from "../../utils/hotspotRedirect";
import { buildAdSrcDoc } from "../../utils/adsense";
import { detectarDispositivo, detectarSistemaOperacional } from "../../utils/deviceDetect";

// Extrai o ID do vídeo do YouTube da URL canônica salva no backend
function getYoutubeId(url) {
  const m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(url || "");
  return m ? m[1] : null;
}

export default function CampanhaPlayer() {
  const { portalId } = useParams();
  const [searchParams] = useSearchParams();

  const mikrotikId = searchParams.get("mikrotik_id") || portalId;
  const isPreview = searchParams.get("preview") === "1";

  // Modo login (fluxo cadastro → propaganda → status): a página de cadastro
  // manda as credenciais e, ao fim da campanha, o player autentica no MikroTik.
  const loginGateway = searchParams.get("gateway");
  const loginUsername = searchParams.get("username");
  const loginPassword = searchParams.get("password");
  const modoLogin = !!(loginGateway && loginUsername);

  const [itens, setItens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 for current item
  const [loaded, setLoaded] = useState(false);
  const [ended, setEnded] = useState(false);
  // Campanha terminou e o modoLogin está pronto pra conectar — só acontece
  // quando o cliente clica no botão (nada de redirect automático).
  const [prontoParaNavegar, setProntoParaNavegar] = useState(false);

  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const videoRef = useRef(null);
  const youtubeIframeRef = useRef(null);
  const campanhaIdRef = useRef(null);
  const impressoesReportadasRef = useRef(new Set());
  const [videoDur, setVideoDur] = useState(0); // duração real do vídeo (p/ contagem)
  const [ytMuted, setYtMuted] = useState(true); // autoplay do YouTube só funciona mudo
  // imagem/afiliado só começam a contar o tempo depois que a mídia terminar de
  // carregar (onLoad da <img>) — sem isso, itens com imagem grande/lenta eram
  // pulados antes mesmo de aparecerem na tela.
  const [mediaReady, setMediaReady] = useState(true);
  // Imagem de produto de afiliado costuma vir de site externo com proteção
  // contra hotlink/CORS — se falhar, mostra um placeholder mas NÃO pula o
  // item (título/preço/link ainda são úteis e o tempo configurado é respeitado).
  const [afiliadoImgErro, setAfiliadoImgErro] = useState(false);
  // Feedback visual breve ao copiar o código do cupom
  const [cupomCopiado, setCupomCopiado] = useState(false);
  // Trava os botões de resposta da pesquisa enquanto o POST está em voo
  const [psEnviando, setPsEnviando] = useState(false);

  // Resolvidos uma única vez por sessão — usados tanto pro gate de segmentação
  // (query params do GET) quanto pro tracking de impressão/clique.
  const dispositivoRef = useRef(detectarDispositivo());
  const sistemaOperacionalRef = useRef(detectarSistemaOperacional());
  const mikrotikIdParam = searchParams.get("mikrotik_id") || null;
  const macParam = searchParams.get("mac") || null;

  const registrarEvento = useCallback((itemId, tipoEvento) => {
    if (isPreview || !campanhaIdRef.current) return;
    axios
      .post(`/api/public/campanha/${portalId}/evento`, {
        campanha_id: campanhaIdRef.current,
        item_id: itemId,
        tipo_evento: tipoEvento,
        dispositivo: dispositivoRef.current,
        sistema_operacional: sistemaOperacionalRef.current,
        mikrotik_id: mikrotikIdParam,
      })
      .catch(() => {});
  }, [isPreview, portalId, mikrotikIdParam]);

  // Build destination URL preserving all original query params + campanha_vista=1
  const buildRedirectUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("campanha_vista", "1");
    return `/hotspot/redirect/${mikrotikId}?${params.toString()}`;
  }, [searchParams, mikrotikId]);

  const doRedirect = useCallback(() => {
    if (isPreview) {
      setEnded(true);
    } else if (modoLogin) {
      // Não conecta sozinho: mostra a tela com o botão "Ir para navegação" e
      // só chama redirecionarHotspot quando o cliente clicar.
      setProntoParaNavegar(true);
    } else {
      window.location.href = buildRedirectUrl();
    }
  }, [isPreview, modoLogin, buildRedirectUrl]);

  // `doRedirect` muda de identidade a cada render (useSearchParams() do React
  // Router não é referencialmente estável, e a barra de progresso já causa
  // dezenas de renders por segundo via requestAnimationFrame). Sem esta ref,
  // os useEffects abaixo que chamam doRedirect entrariam num loop de
  // refetch/redirect a cada frame. Guardamos sempre a versão mais recente
  // aqui e os efeitos dependem só de valores primitivos estáveis.
  const doRedirectRef = useRef(doRedirect);
  useEffect(() => {
    doRedirectRef.current = doRedirect;
  }, [doRedirect]);

  const handleIrParaNavegacao = useCallback(() => {
    redirecionarHotspot(loginGateway, loginUsername, loginPassword);
  }, [loginGateway, loginUsername, loginPassword]);

  // "Contratar um plano": ainda não conectou no MikroTik, então navega pro
  // cadastro do fluxo pago em vez de usar as credenciais grátis já emitidas.
  const handleContratarPlano = useCallback(() => {
    const params = new URLSearchParams({
      mac: searchParams.get("mac") || "",
      ip: searchParams.get("ip") || "",
      mikrotik_id: searchParams.get("mikrotik_id") || "",
      empresa_id: searchParams.get("empresa_id") || "",
    });
    window.location.href = `/cadastro-cliente?${params.toString()}`;
  }, [searchParams]);

  // Advance to next item or end
  const advance = useCallback((nextIndex) => {
    setProgress(0);
    startTimeRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setCurrentIndex((prev) => {
      const idx = nextIndex !== undefined ? nextIndex : prev + 1;
      return idx;
    });
  }, []);

  // On mount: fetch campanha (roda só quando portalId/isPreview mudam de verdade —
  // não depende de doRedirect, que muda de identidade a cada render)
  useEffect(() => {
    const qs = new URLSearchParams({
      dispositivo: dispositivoRef.current,
      sistema_operacional: sistemaOperacionalRef.current,
    });
    if (mikrotikIdParam) qs.set("mikrotik_id", mikrotikIdParam);
    if (macParam) qs.set("mac", macParam);

    axios
      .get(`/api/public/campanha/${portalId}?${qs.toString()}`)
      .then((res) => {
        const data = res.data?.data;
        if (data && Array.isArray(data.itens) && data.itens.length > 0) {
          campanhaIdRef.current = data.id;
          const sorted = [...data.itens].sort((a, b) => a.ordem - b.ordem);
          setItens(sorted);
          setLoaded(true);

          if (!isPreview) {
            axios
              .post(`/api/public/campanha/${portalId}/view`, { campanha_id: data.id })
              .catch(() => {});
          }
        } else {
          doRedirectRef.current();
        }
      })
      .catch(() => {
        doRedirectRef.current();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalId, isPreview]);

  // When currentIndex advances past the last item, redirect
  useEffect(() => {
    if (loaded && itens.length > 0 && currentIndex >= itens.length) {
      doRedirectRef.current();
    }
  }, [currentIndex, itens.length, loaded]);

  // RAF loop for image items
  const startImageTimer = useCallback(
    (duracaoMs) => {
      startTimeRef.current = performance.now();

      const tick = (now) => {
        const elapsed = now - startTimeRef.current;
        const p = Math.min(elapsed / duracaoMs, 1);
        setProgress(p);

        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
          advance();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [advance]
  );

  // Handle item change
  useEffect(() => {
    if (!loaded || itens.length === 0 || currentIndex >= itens.length) return;

    const item = itens[currentIndex];
    setProgress(0);
    setVideoDur(0);
    setYtMuted(true); // cada slide de YouTube novo começa mudo (autoplay exige)
    setCupomCopiado(false);
    setPsEnviando(false);
    startTimeRef.current = null;

    // Cancel any running RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (item.tipo === "youtube" && !getYoutubeId(item.arquivo_url)) {
      // Link do YouTube inválido/quebrado — não trava a campanha, pula o item
      advance();
      return;
    }

    // Impressão: 1 vez por item por sessão de visualização (revisitar o mesmo
    // item ao voltar/rever não conta de novo)
    if (!impressoesReportadasRef.current.has(item.id)) {
      impressoesReportadasRef.current.add(item.id);
      registrarEvento(item.id, "impressao");
    }

    // imagem e afiliado têm <img> que pode demorar pra carregar (arquivo grande,
    // rede lenta) — a contagem só começa no onLoad da imagem (handleMediaLoaded).
    // Sem isso, o timer corria em paralelo ao carregamento e o item era pulado
    // antes mesmo de aparecer na tela.
    const aguardaCarregamento = item.tipo === "imagem" || item.tipo === "afiliado";
    setMediaReady(!aguardaCarregamento);
    setAfiliadoImgErro(false);

    if (item.tipo !== "video" && item.tipo !== "pesquisa" && !aguardaCarregamento) {
      // adsense e youtube avançam por timer desde já
      const duracaoMs = (item.duracao_segundos || 5) * 1000;
      startImageTimer(duracaoMs);
    }
    // For video, progress is driven by onTimeUpdate
    // For pesquisa, não tem timer — só avança quando o cliente responde ou pula (handleResponderPesquisa/handlePularPesquisa)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [currentIndex, itens, loaded, startImageTimer, registrarEvento]);

  // Dispara quando a <img> do slide atual (imagem ou afiliado) termina de carregar
  const handleMediaLoaded = useCallback(
    (it) => {
      setMediaReady(true);
      const duracaoMs = (it.duracao_segundos || 5) * 1000;
      startImageTimer(duracaoMs);
    },
    [startImageTimer]
  );

  // Click handler: left half = prev, right half = next
  const handleClick = useCallback(
    (e) => {
      // Don't intercept clicks on "Saiba mais" button (stopPropagation handles it)
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isLeft = x < rect.width / 2;

      if (isLeft) {
        // Go to previous or restart current
        if (currentIndex === 0) {
          // Restart current
          setProgress(0);
          startTimeRef.current = null;
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          const item = itens[0];
          if (item.tipo !== "video") {
            startImageTimer((item.duracao_segundos || 5) * 1000);
          } else if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
          }
        } else {
          advance(currentIndex - 1);
        }
      } else {
        // Go to next or end
        if (currentIndex >= itens.length - 1) {
          doRedirect();
        } else {
          advance(currentIndex + 1);
        }
      }
    },
    [currentIndex, itens, advance, doRedirect, startImageTimer]
  );

  // Liga/desliga o som do YouTube via postMessage (YouTube IFrame API), sem
  // depender dos controles nativos (que trazem barra de progresso, engrenagem
  // e link "assistir no YouTube" — poluição visual no player estilo stories).
  const toggleYoutubeMute = useCallback(
    (e) => {
      e.stopPropagation();
      const win = youtubeIframeRef.current?.contentWindow;
      if (!win) return;
      const novoMuted = !ytMuted;
      win.postMessage(JSON.stringify({ event: "command", func: novoMuted ? "mute" : "unMute", args: [] }), "*");
      setYtMuted(novoMuted);
    },
    [ytMuted]
  );

  // Video event handlers
  const handleVideoTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress(video.currentTime / video.duration);
  }, []);

  const handleVideoLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration) setVideoDur(video.duration);
  }, []);

  const handleVideoEnded = useCallback(() => {
    advance();
  }, [advance]);

  const handleVideoError = useCallback(() => {
    advance();
  }, [advance]);

  const handleImageError = useCallback(() => {
    advance();
  }, [advance]);

  // Imagem do produto de afiliado falhou (hotlink/CORS bloqueado pelo site de
  // origem, link quebrado etc.) — mostra placeholder no lugar mas continua
  // contando o tempo normalmente, em vez de pular o item inteiro.
  const handleAfiliadoImageError = useCallback(
    (it) => {
      setAfiliadoImgErro(true);
      handleMediaLoaded(it);
    },
    [handleMediaLoaded]
  );

  // Card de afiliado inteiro é clicável (imagem, título, preço, descrição) —
  // stopPropagation impede que o clique também dispare a navegação prev/next
  // da tela cheia (handleClick).
  const handleAbrirAfiliado = useCallback((link, itemId) => (e) => {
    e.stopPropagation();
    if (link) {
      registrarEvento(itemId, "clique");
      window.open(link, "_blank", "noopener,noreferrer");
    }
  }, [registrarEvento]);

  const handleCopiarCupom = useCallback((item) => (e) => {
    e.stopPropagation();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(item.cupom_codigo).catch(() => {});
    }
    registrarEvento(item.id, "clique");
    setCupomCopiado(true);
  }, [registrarEvento]);

  const handleUsarCupom = useCallback((item) => (e) => {
    e.stopPropagation();
    registrarEvento(item.id, "clique");
    if (item.cupom_link) window.open(item.cupom_link, "_blank", "noopener,noreferrer");
  }, [registrarEvento]);

  // Envia a resposta da pesquisa (opcao_index p/ múltipla escolha, nota p/ escala)
  // e avança pro próximo item. Best-effort: se o POST falhar, avança do mesmo jeito
  // — não faz sentido travar o cliente no meio da campanha por causa disso.
  const handleResponderPesquisa = useCallback((item, payload) => (e) => {
    e?.stopPropagation();
    if (psEnviando || isPreview) { if (isPreview) advance(); return; }
    setPsEnviando(true);
    axios
      .post(`/api/public/campanha/${portalId}/pesquisa/responder`, {
        campanha_id: campanhaIdRef.current,
        item_id: item.id,
        mac: macParam,
        ...payload,
      })
      .catch(() => {})
      .finally(() => advance());
  }, [psEnviando, isPreview, portalId, macParam, advance]);

  const handlePularPesquisa = useCallback((e) => {
    e?.stopPropagation();
    advance();
  }, [advance]);

  if (!loaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (ended) {
    // Preview mode end screen
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white px-6">
          <p className="text-2xl font-bold mb-2">Fim da pré-visualização</p>
          <p className="text-gray-400 text-sm">
            Em modo real, o usuário seria redirecionado ao portal.
          </p>
        </div>
      </div>
    );
  }

  if (prontoParaNavegar) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl p-8 text-center text-white">
          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xl font-bold mb-2">Tudo pronto!</p>
          <p className="text-gray-400 text-sm mb-6">
            Conecte agora com anúncios, ou contrate um plano pago sem interrupções.
          </p>
          <button
            onClick={handleIrParaNavegacao}
            className="w-full bg-green-500 text-black font-semibold py-3 rounded-full shadow hover:bg-green-400 active:bg-green-600 transition-colors mb-3"
          >
            Conectar agora
          </button>
          <button
            onClick={handleContratarPlano}
            className="w-full bg-white/10 border border-white/15 text-white font-semibold py-3 rounded-full hover:bg-white/15 active:bg-white/20 transition-colors"
          >
            Contratar um plano
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= itens.length) {
    return (
      <div className="fixed inset-0 bg-black" />
    );
  }

  const item = itens[currentIndex];

  // Contagem regressiva do slide atual (vídeo usa a duração real do arquivo)
  const durSegundos = item.tipo === "video" ? videoDur : (item.duracao_segundos || 5);
  const restante = durSegundos ? Math.max(0, Math.ceil((1 - progress) * durSegundos)) : null;

  return (
    <div
      className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 select-none"
      onClick={handleClick}
      style={{ touchAction: "manipulation" }}
    >
      <div className="w-full max-w-md flex flex-col">
        {/* Card centralizado estilo modal */}
        <div className="bg-[#12141c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Progress bar */}
          <div className="flex gap-1 px-3 pt-3 pb-2">
            {itens.map((_, idx) => {
              let fill = 0;
              if (idx < currentIndex) fill = 1;
              else if (idx === currentIndex) fill = progress;
              return (
                <div
                  key={idx}
                  className="flex-1 h-1 rounded-full bg-white bg-opacity-30 overflow-hidden"
                >
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${fill * 100}%`, transition: "none" }}
                  />
                </div>
              );
            })}
          </div>

          {/* Media */}
          <div className="relative w-full h-[60vh] max-h-[600px] min-h-[320px] bg-black flex items-center justify-center overflow-hidden">
            {!mediaReady && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
              </div>
            )}
            {item.tipo === "imagem" ? (
              <img
                key={item.id}
                src={item.arquivo_url}
                alt={item.titulo || ""}
                onLoad={() => handleMediaLoaded(item)}
                onError={handleImageError}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : item.tipo === "youtube" ? (
              /* mute=1 garante autoplay em qualquer navegador (autoplay com som é
                 bloqueado por padrão). controls=0 mantém o visual limpo de stories
                 (sem barra de progresso/engrenagem/link do YouTube); o botão de som
                 customizado abaixo liga/desliga via postMessage (enablejsapi=1).
                 Cliques no vídeo não navegam; navegação continua fora do card e o
                 avanço é por timer. */
              <iframe
                key={item.id}
                ref={youtubeIframeRef}
                title={item.titulo || "Vídeo"}
                src={`https://www.youtube.com/embed/${getYoutubeId(item.arquivo_url)}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&enablejsapi=1`}
                allow="autoplay; encrypted-media"
                className="w-full h-full"
                style={{ border: 0 }}
              />
            ) : item.tipo === "adsense" ? (
              <div
                key={item.id}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-full h-full"
              >
                <iframe
                  title={item.titulo || "Anúncio"}
                  srcDoc={buildAdSrcDoc(item)}
                  scrolling="no"
                  style={{
                    border: 0,
                    width: item.ad_width ? `${item.ad_width}px` : "100%",
                    height: item.ad_height ? `${item.ad_height}px` : "100%",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              </div>
            ) : item.tipo === "afiliado" ? (
              <div
                key={item.id}
                onClick={handleAbrirAfiliado(item.afiliado_link, item.id)}
                className="w-full h-full flex flex-col bg-[#12141c] cursor-pointer"
              >
                {/* Imagem do produto */}
                <div className="relative flex-[3] min-h-0 bg-white flex items-center justify-center overflow-hidden">
                  {afiliadoImgErro ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7L12 3 4 7m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={item.afiliado_imagem_url}
                      alt={item.titulo || "Produto"}
                      referrerPolicy="no-referrer"
                      onLoad={() => handleMediaLoaded(item)}
                      onError={() => handleAfiliadoImageError(item)}
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  )}
                  {item.afiliado_preco_original > item.afiliado_preco && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                      -{Math.round((1 - item.afiliado_preco / item.afiliado_preco_original) * 100)}%
                    </span>
                  )}
                </div>

                {/* Informações do produto */}
                <div className="flex-[2] min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-1.5">
                  {item.titulo && (
                    <p className="text-white text-base font-semibold leading-snug">{item.titulo}</p>
                  )}
                  {item.afiliado_descricao && (
                    <p className="text-gray-400 text-xs leading-snug line-clamp-3">{item.afiliado_descricao}</p>
                  )}
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-green-400 text-xl font-bold">
                      {Number(item.afiliado_preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                    {item.afiliado_preco_original > item.afiliado_preco && (
                      <span className="text-gray-500 text-sm line-through">
                        {Number(item.afiliado_preco_original).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    )}
                  </div>
                  {Array.isArray(item.afiliado_destaques) && item.afiliado_destaques.length > 0 && (
                    <ul className="text-xs text-gray-300 space-y-0.5 mt-1">
                      {item.afiliado_destaques.map((d, i) => (
                        <li key={i}>✓ {d}</li>
                      ))}
                    </ul>
                  )}
                  {/* Puramente visual — o clique é tratado pelo card inteiro (handleAbrirAfiliado),
                      evitando abrir 2 abas (uma pelo <a>, outra pelo bubbling até o card) */}
                  <span className="mt-2 inline-block text-center bg-green-500 text-black text-sm font-semibold px-4 py-2 rounded-full shadow">
                    Ver oferta
                  </span>
                </div>
              </div>
            ) : item.tipo === "cupom" ? (
              <div
                key={item.id}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-pink-950/40 to-[#12141c] px-6 text-center"
              >
                <Ticket className="w-10 h-10 text-pink-400 mb-3" />
                {item.titulo && (
                  <p className="text-white text-base font-semibold mb-1">{item.titulo}</p>
                )}
                <p className="text-pink-400 text-2xl font-bold mb-3">
                  {item.cupom_desconto_tipo === "percentual"
                    ? `${Number(item.cupom_desconto_valor)}% OFF`
                    : `${Number(item.cupom_desconto_valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} OFF`}
                </p>

                <div
                  onClick={handleCopiarCupom(item)}
                  className="border-2 border-dashed border-pink-400/60 rounded-lg px-5 py-2 mb-1 cursor-pointer"
                >
                  <span className="text-white text-xl font-mono tracking-widest">{item.cupom_codigo}</span>
                </div>
                <p className="text-xs text-pink-300 mb-3 h-4">
                  {cupomCopiado ? "Código copiado!" : "Toque para copiar o código"}
                </p>

                {item.cupom_descricao && (
                  <p className="text-gray-400 text-xs leading-snug mb-3 max-w-xs">{item.cupom_descricao}</p>
                )}
                {item.cupom_validade && (
                  <p className="text-gray-500 text-xs mb-3">
                    Válido até {new Date(item.cupom_validade).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                  </p>
                )}

                {item.cupom_link && (
                  <button
                    onClick={handleUsarCupom(item)}
                    className="inline-block bg-pink-500 text-black text-sm font-semibold px-5 py-2 rounded-full shadow hover:bg-pink-400"
                  >
                    Usar cupom
                  </button>
                )}
              </div>
            ) : item.tipo === "pesquisa" ? (
              <div
                key={item.id}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-cyan-950/40 to-[#12141c] px-6 text-center overflow-y-auto"
              >
                <p className="text-white text-lg font-semibold mb-6">{item.pesquisa_pergunta}</p>

                {item.pesquisa_formato === "multipla_escolha" ? (
                  <div className="w-full max-w-xs space-y-2">
                    {(item.pesquisa_opcoes || []).map((opcao, idx) => (
                      <button
                        key={idx}
                        disabled={psEnviando}
                        onClick={handleResponderPesquisa(item, { opcao_index: idx })}
                        className="w-full text-left bg-white/5 hover:bg-cyan-500/20 border border-white/15 text-white text-sm px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {opcao}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <button
                        key={nota}
                        disabled={psEnviando}
                        onClick={handleResponderPesquisa(item, { nota })}
                        title={`${nota} estrela${nota > 1 ? "s" : ""}`}
                        className="w-11 h-11 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/15 text-white text-base font-semibold transition-colors disabled:opacity-50"
                      >
                        {nota}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={handlePularPesquisa}
                  disabled={psEnviando}
                  className="mt-6 text-xs text-gray-400 hover:text-gray-300 underline disabled:opacity-50"
                >
                  Pular
                </button>
              </div>
            ) : (
              <video
                key={item.id}
                ref={videoRef}
                src={item.arquivo_url}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={handleVideoLoadedMetadata}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                className="w-full h-full object-cover"
              />
            )}

            {/* Botão de som — só no slide de YouTube (autoplay começa mudo) */}
            {item.tipo === "youtube" && (
              <button
                onClick={toggleYoutubeMute}
                title={ytMuted ? "Ativar som" : "Silenciar"}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                {ytMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {/* Overlay: titulo + link (produto afiliado/cupom/pesquisa já mostram tudo no próprio card) */}
            {(item.titulo || item.link_destino) && item.tipo !== "afiliado" && item.tipo !== "cupom" && item.tipo !== "pesquisa" && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
                {item.titulo && (
                  <p className="text-white text-base font-semibold mb-2 drop-shadow">
                    {item.titulo}
                  </p>
                )}
                {item.link_destino && (
                  <a
                    href={item.link_destino}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      registrarEvento(item.id, "clique");
                    }}
                    className="inline-block bg-white text-black text-sm font-semibold px-4 py-2 rounded-full shadow hover:bg-gray-100 active:bg-gray-200"
                  >
                    Saiba mais
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contagem do tempo (pesquisa não tem timer, espera resposta) */}
        <div className="mt-4 flex justify-center">
          <div className="bg-white/10 border border-white/15 text-white text-sm px-4 py-2 rounded-full backdrop-blur">
            {item.tipo === "pesquisa"
              ? "Responda para continuar"
              : !mediaReady ? "Carregando..." : (restante !== null ? `Próximo em ${restante}s` : "Carregando...")}
          </div>
        </div>
      </div>
    </div>
  );
}
