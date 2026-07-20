// src/components/public/CampanhaPopupCard.jsx
import React, { useState } from "react";
import { Ticket } from "lucide-react";
import { buildAdSrcDoc } from "../../utils/adsense";
import CampanhaStorySlide from "./CampanhaStorySlide";

/**
 * Renderiza o conteúdo de um único item de campanha em formato de card.
 * Tipos vídeo/YouTube usam o slide "story" (CampanhaStorySlide, com barra de
 * progresso e sem controle de pular) — quem monta este componente (o pop-up
 * pré-login) decide se/quando dispensar com base em `onConcluido`. Os demais
 * tipos (afiliado/cupom/adsense/imagem) continuam sem timer, dispensáveis a
 * qualquer momento.
 *
 * `onClique` é chamado quando o cliente interage com um link/CTA do card,
 * pra quem monta o componente (overlay pré-login ou página pós-login)
 * registrar o evento de clique sem duplicar a lógica por tipo aqui dentro.
 * `onConcluido` é chamado quando um item de vídeo/YouTube termina de tocar.
 */
export default function CampanhaPopupCard({ item, onClique, onConcluido }) {
  const [imgErro, setImgErro] = useState(false);
  const [copiado, setCopiado] = useState(false);

  if (!item) return null;

  const handleAbrirLink = (link) => (e) => {
    e.stopPropagation();
    if (!link) return;
    onClique?.();
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleCopiarCupom = (e) => {
    e.stopPropagation();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(item.cupom_codigo).catch(() => {});
    }
    onClique?.();
    setCopiado(true);
  };

  if (item.tipo === "afiliado") {
    return (
      <div className="w-full flex flex-col bg-[#12141c] cursor-pointer" onClick={handleAbrirLink(item.afiliado_link)}>
        <div className="relative min-h-[220px] bg-white flex items-center justify-center overflow-hidden">
          {imgErro ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 py-16">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7L12 3 4 7m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          ) : (
            <img
              src={item.afiliado_imagem_url}
              alt={item.titulo || "Produto"}
              referrerPolicy="no-referrer"
              onError={() => setImgErro(true)}
              className="w-full max-h-64 object-contain"
              draggable={false}
            />
          )}
          {item.afiliado_preco_original > item.afiliado_preco && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
              -{Math.round((1 - item.afiliado_preco / item.afiliado_preco_original) * 100)}%
            </span>
          )}
        </div>
        <div className="px-4 py-3 flex flex-col gap-1.5">
          {item.titulo && <p className="text-white text-base font-semibold leading-snug">{item.titulo}</p>}
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
          <span className="mt-2 inline-block text-center bg-green-500 text-black text-sm font-semibold px-4 py-2 rounded-full shadow">
            Ver oferta
          </span>
        </div>
      </div>
    );
  }

  if (item.tipo === "cupom") {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-gradient-to-b from-pink-950/40 to-[#12141c] px-6 py-8 text-center">
        <Ticket className="w-10 h-10 text-pink-400 mb-3" />
        {item.titulo && <p className="text-white text-base font-semibold mb-1">{item.titulo}</p>}
        <p className="text-pink-400 text-2xl font-bold mb-3">
          {item.cupom_desconto_tipo === "percentual"
            ? `${Number(item.cupom_desconto_valor)}% OFF`
            : `${Number(item.cupom_desconto_valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} OFF`}
        </p>
        <div onClick={handleCopiarCupom} className="border-2 border-dashed border-pink-400/60 rounded-lg px-5 py-2 mb-1 cursor-pointer">
          <span className="text-white text-xl font-mono tracking-widest">{item.cupom_codigo}</span>
        </div>
        <p className="text-xs text-pink-300 mb-3 h-4">{copiado ? "Código copiado!" : "Toque para copiar o código"}</p>
        {item.cupom_descricao && <p className="text-gray-400 text-xs leading-snug mb-3 max-w-xs">{item.cupom_descricao}</p>}
        {item.cupom_link && (
          <button
            onClick={handleAbrirLink(item.cupom_link)}
            className="inline-block bg-pink-500 text-black text-sm font-semibold px-5 py-2 rounded-full shadow hover:bg-pink-400"
          >
            Usar cupom
          </button>
        )}
      </div>
    );
  }

  if (item.tipo === "video" || item.tipo === "youtube") {
    return <CampanhaStorySlide item={item} onEnded={onConcluido} />;
  }

  if (item.tipo === "adsense") {
    return (
      <div className="w-full flex items-center justify-center bg-white py-2">
        <iframe
          title={item.titulo || "Anúncio"}
          srcDoc={buildAdSrcDoc(item)}
          scrolling="no"
          style={{
            border: 0,
            width: item.ad_width ? `${item.ad_width}px` : "100%",
            height: item.ad_height ? `${item.ad_height}px` : "250px",
            maxWidth: "100%",
          }}
        />
      </div>
    );
  }

  if (item.tipo === "imagem") {
    return (
      <div className="w-full flex flex-col bg-[#12141c] cursor-pointer" onClick={handleAbrirLink(item.link_destino)}>
        <img
          src={item.arquivo_url}
          alt={item.titulo || ""}
          onError={() => setImgErro(true)}
          className="w-full max-h-72 object-cover"
          draggable={false}
        />
        {(item.titulo || item.link_destino) && (
          <div className="px-4 py-3">
            {item.titulo && <p className="text-white text-base font-semibold mb-2">{item.titulo}</p>}
            {item.link_destino && (
              <span className="inline-block bg-white text-black text-sm font-semibold px-4 py-2 rounded-full shadow">
                Saiba mais
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // pesquisa (e outros tipos futuros): responder uma pesquisa num pop-up
  // dispensável exigiria persistência de estado que o modo pop-up não cobre
  // hoje — não renderiza nada em vez de mostrar um card quebrado.
  return null;
}
