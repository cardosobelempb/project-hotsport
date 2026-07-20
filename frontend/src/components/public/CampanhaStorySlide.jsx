import React, { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Extrai o ID do vídeo do YouTube da URL canônica salva no backend — mesma
// regex usada em CampanhaPlayer.jsx/CampanhaPopupCard.jsx.
function getYoutubeId(url) {
  const m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(url || "");
  return m ? m[1] : null;
}

/**
 * Slide único de vídeo/YouTube em formato "story" (tela cheia, barra de
 * progresso, contagem regressiva), sem nenhum controle de pular/fechar —
 * quem monta decide a chrome (botão de continuar, backdrop). `onEnded` só
 * dispara quando o vídeo termina de verdade (ou dá erro, pra não travar o
 * cliente com um arquivo quebrado); YouTube não expõe evento de fim sem a
 * IFrame API, então usa a mesma duração configurada pelo admin que o
 * CampanhaPlayer já usa pros demais tipos por timer.
 */
export default function CampanhaStorySlide({ item, onEnded }) {
  const videoRef = useRef(null);
  const youtubeIframeRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const [progress, setProgress] = useState(0);
  const [videoDur, setVideoDur] = useState(0);
  const [ytMuted, setYtMuted] = useState(true);

  const isYoutube = item?.tipo === "youtube";
  const youtubeId = isYoutube ? getYoutubeId(item.arquivo_url) : null;

  // YouTube: sem IFrame API, usa a duracao configurada no item por timer
  // (mesmo padrao que o CampanhaPlayer ja usa pros itens sem tracking real).
  useEffect(() => {
    if (!isYoutube) return;
    if (!youtubeId) {
      onEndedRef.current?.();
      return;
    }
    const duracaoMs = (item.duracao_segundos || 15) * 1000;
    startTimeRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / duracaoMs, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        onEndedRef.current?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYoutube, youtubeId, item?.id]);

  const handleVideoLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration) setVideoDur(video.duration);
  }, []);

  const handleVideoTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress(video.currentTime / video.duration);
  }, []);

  const handleVideoEnded = useCallback(() => {
    setProgress(1);
    onEndedRef.current?.();
  }, []);

  // Arquivo quebrado/URL invalida: nao trava o cliente esperando um vídeo
  // que nunca vai carregar — libera o botão de continuar.
  const handleVideoError = useCallback(() => {
    onEndedRef.current?.();
  }, []);

  const toggleYoutubeMute = useCallback((e) => {
    e.stopPropagation();
    const win = youtubeIframeRef.current?.contentWindow;
    if (!win) return;
    const novoMuted = !ytMuted;
    win.postMessage(JSON.stringify({ event: "command", func: novoMuted ? "mute" : "unMute", args: [] }), "*");
    setYtMuted(novoMuted);
  }, [ytMuted]);

  if (!item) return null;

  const durSegundos = isYoutube ? (item.duracao_segundos || 15) : videoDur;
  const restante = durSegundos ? Math.max(0, Math.ceil((1 - progress) * durSegundos)) : null;

  return (
    <div className="w-full flex flex-col">
      {/* Barra de progresso (1 segmento — slide unico) */}
      <div className="px-3 pt-3 pb-2">
        <div className="w-full h-1 rounded-full bg-white bg-opacity-30 overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${progress * 100}%`, transition: "none" }}
          />
        </div>
      </div>

      <div className="relative w-full h-[60vh] max-h-[600px] min-h-[280px] bg-black flex items-center justify-center overflow-hidden">
        {isYoutube ? (
          youtubeId && (
            <iframe
              key={item.id}
              ref={youtubeIframeRef}
              title={item.titulo || "Vídeo"}
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&enablejsapi=1`}
              allow="autoplay; encrypted-media"
              className="w-full h-full"
              style={{ border: 0 }}
            />
          )
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

        {isYoutube && (
          <button
            onClick={toggleYoutubeMute}
            title={ytMuted ? "Ativar som" : "Silenciar"}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            {ytMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        {item.titulo && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
            <p className="text-white text-base font-semibold drop-shadow">{item.titulo}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <div className="bg-white/10 border border-white/15 text-white text-sm px-4 py-2 rounded-full backdrop-blur">
          {restante !== null ? `Libera em ${restante}s` : "Carregando..."}
        </div>
      </div>
    </div>
  );
}
