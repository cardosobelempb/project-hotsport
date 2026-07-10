import React, { useEffect, useRef, useState } from "react";
import { Plus, Megaphone, Pencil, Trash2, CheckCircle2, LayoutTemplate, ImagePlus } from "lucide-react";
import {
  Button, IconButton, Input, Select, Textarea, Card, Table, Badge, StatusToggle, Alert, Modal,
  Checkbox, SegmentedControl, EmptyState, StatCard, PreviewBox,
} from "../ui";
import Pagination from "../ui/Pagination";
import usePagination from "../../hooks/usePagination";
import { useFeedback } from "../../contexts/FeedbackContext";
import { parseAdsenseCode } from "../../utils/adsense";

const PAGINAS = [
  { key: "lgpd", label: "Cadastro LGPD" },
  { key: "lead", label: "Captura de Lead" },
  { key: "lead_passivo", label: "Lead Passivo" },
  { key: "trial_tempo", label: "Trial por Tempo" },
  { key: "cadastro_cliente", label: "Cadastro de Cliente" },
  { key: "planos", label: "Planos" },
  { key: "pagamento", label: "Pagamento" },
  { key: "login", label: "Login Hotspot" },
  { key: "reconexao", label: "Reconexão" },
  { key: "acesso_ativo", label: "Acesso Ativo" },
];

function labelPaginas(paginas) {
  if (!Array.isArray(paginas) || paginas.includes("todas")) return "Todas";
  return paginas
    .map((p) => PAGINAS.find((x) => x.key === p)?.label || p)
    .join(", ");
}

export default function BannersTab() {
  const { showError, showInfo, confirm } = useFeedback();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null); // banner sendo editado (null = criar)
  const [salvando, setSalvando] = useState(false);
  const token = localStorage.getItem("admin_token");

  // Form
  const [nome, setNome] = useState("");
  const [posicao, setPosicao] = useState("rodape");
  const [paginasSel, setPaginasSel] = useState(["todas"]);
  const [tipoTab, setTipoTab] = useState("imagem"); // imagem | adsense
  const [arquivo, setArquivo] = useState(null);
  const [linkDestino, setLinkDestino] = useState("");
  const [adCodigo, setAdCodigo] = useState("");
  const fileRef = useRef(null);

  const adParsed = parseAdsenseCode(adCodigo);
  const todas = paginasSel.includes("todas");

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/banners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar banners");
      setBanners(data.data || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const { pageData, page, setPage, totalPages, total } = usePagination(banners, 12);

  const totalBanners = banners.length;
  const bannersAtivos = banners.reduce((acc, b) => acc + (b.ativo ? 1 : 0), 0);
  const noTopo = banners.reduce((acc, b) => acc + (b.posicao === "topo" ? 1 : 0), 0);

  const abrirCriar = () => {
    setEditando(null);
    setNome("");
    setPosicao("rodape");
    setPaginasSel(["todas"]);
    setTipoTab("imagem");
    setArquivo(null);
    setLinkDestino("");
    setAdCodigo("");
    setShowModal(true);
  };

  const abrirEditar = (b) => {
    setEditando(b);
    setNome(b.nome);
    setPosicao(b.posicao);
    setPaginasSel(Array.isArray(b.paginas) ? b.paginas : ["todas"]);
    setTipoTab(b.tipo);
    setArquivo(null);
    setLinkDestino(b.link_destino || "");
    setAdCodigo("");
    setShowModal(true);
  };

  const togglePagina = (key) => {
    if (key === "todas") {
      setPaginasSel(todas ? [] : ["todas"]);
      return;
    }
    setPaginasSel((prev) => {
      const semTodas = prev.filter((p) => p !== "todas");
      return semTodas.includes(key)
        ? semTodas.filter((p) => p !== key)
        : [...semTodas, key];
    });
  };

  const podeSalvar =
    nome.trim() &&
    paginasSel.length > 0 &&
    (editando
      ? true
      : tipoTab === "imagem"
      ? !!arquivo
      : !!(adParsed && !adParsed.error));

  const handleSalvar = async () => {
    if (!podeSalvar) return;
    setSalvando(true);
    try {
      let res;
      if (editando) {
        res = await fetch(`/api/banners/${editando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome,
            posicao,
            paginas: JSON.stringify(paginasSel),
            link_destino: editando.tipo === "imagem" ? linkDestino : undefined,
          }),
        });
      } else {
        const fd = new FormData();
        fd.append("nome", nome);
        fd.append("tipo", tipoTab);
        fd.append("posicao", posicao);
        fd.append("paginas", JSON.stringify(paginasSel));
        if (tipoTab === "imagem") {
          fd.append("imagem", arquivo);
          if (linkDestino.trim()) fd.append("link_destino", linkDestino.trim());
        } else {
          fd.append("ad_client", adParsed.ad_client);
          fd.append("ad_slot", adParsed.ad_slot);
          if (adParsed.ad_format) fd.append("ad_format", adParsed.ad_format);
          fd.append("ad_full_width", adParsed.ad_full_width ? "true" : "false");
          if (adParsed.ad_width) fd.append("ad_width", adParsed.ad_width);
          if (adParsed.ad_height) fd.append("ad_height", adParsed.ad_height);
        }
        res = await fetch("/api/banners", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar banner");
      setShowModal(false);
      carregar();
    } catch (err) {
      showError(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleAtivo = async (b) => {
    try {
      const res = await fetch(`/api/banners/${b.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ativo: !b.ativo }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar banner");
      carregar();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeletar = async (id) => {
    if (!(await confirm({ title: "Excluir banner", message: "Deseja realmente excluir este banner?", danger: true, confirmText: "Excluir" }))) return;
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao excluir banner");
      carregar();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button icon={Plus} onClick={abrirCriar}>Novo Banner</Button>
      </div>

      {!loading && (
        <StatCard.Row>
          <StatCard icon={Megaphone} label="Total de banners" value={totalBanners} color="blue" />
          <StatCard icon={CheckCircle2} label="Banners ativos" value={bannersAtivos} color="green" />
          <StatCard icon={LayoutTemplate} label="No topo" value={`${noTopo} / ${totalBanners}`} color="purple" />
        </StatCard.Row>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Banners das Páginas</h2>
        <p className="text-gray-500 text-xs mb-4">
          Faixas fixas no topo ou rodapé das páginas públicas do portal — imagem clicável ou bloco Google AdSense.
        </p>
        <Table>
          <Table.Head>
            <Table.HeadCell>Banner</Table.HeadCell>
            <Table.HeadCell>Tipo</Table.HeadCell>
            <Table.HeadCell>Posição</Table.HeadCell>
            <Table.HeadCell hideOn="md">Páginas</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Ações</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {loading ? (
              <Table.Loading colSpan={6} />
            ) : banners.length === 0 ? (
              <Table.Empty colSpan={6}>
                <EmptyState
                  icon={Megaphone}
                  title="Nenhum banner cadastrado"
                  description='Clique em "Novo Banner" para criar sua primeira faixa de imagem ou AdSense.'
                  action={<Button icon={Plus} size="sm" onClick={abrirCriar}>Novo Banner</Button>}
                />
              </Table.Empty>
            ) : (
              pageData.map((b) => (
                <Table.Row key={b.id}>
                  <Table.Cell className="font-semibold text-white">
                    <div className="flex items-center gap-2">
                      {b.tipo === "imagem" ? (
                        <img src={b.imagem_url} alt="" className="h-8 w-14 object-cover rounded border border-gray-700" />
                      ) : (
                        <span className="h-8 w-14 flex items-center justify-center rounded border border-gray-700 text-gray-400">
                          <Megaphone className="w-4 h-4" />
                        </span>
                      )}
                      <span className="truncate max-w-[160px]">{b.nome}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={b.tipo === "imagem" ? "neutral" : "info"}>
                      {b.tipo === "imagem" ? "Imagem" : "AdSense"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{b.posicao === "topo" ? "Topo" : "Rodapé"}</Table.Cell>
                  <Table.Cell hideOn="md" className="text-xs max-w-xs truncate">{labelPaginas(b.paginas)}</Table.Cell>
                  <Table.Cell>
                    <StatusToggle ativo={!!b.ativo} onToggle={() => handleToggleAtivo(b)} />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <IconButton icon={Pencil} title="Editar" onClick={() => abrirEditar(b)} />
                      <IconButton icon={Trash2} variant="danger" title="Excluir" onClick={() => handleDeletar(b.id)} />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Card>

      {!loading && banners.length > 0 && (
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} itemLabel="banners" />
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editando ? "Editar banner" : "Novo banner"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSalvar} loading={salvando} disabled={!podeSalvar}>
              {editando ? "Salvar" : "Adicionar"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={<>Nome <span className="text-red-400">*</span></>}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Select label="Posição na página" value={posicao} onChange={(e) => setPosicao(e.target.value)}>
              <option value="rodape">Rodapé (fixo embaixo)</option>
              <option value="topo">Topo (fixo em cima)</option>
            </Select>
          </div>

          {/* Páginas */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Exibir nas páginas</label>
            <Checkbox checked={todas} onChange={() => togglePagina("todas")} label="Todas as páginas" className="mb-2" />
            {!todas && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {PAGINAS.map((p) => (
                  <Checkbox
                    key={p.key}
                    checked={paginasSel.includes(p.key)}
                    onChange={() => togglePagina(p.key)}
                    label={p.label}
                    className="text-xs"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Conteúdo do banner */}
          {editando ? (
            <PreviewBox>
              {editando.tipo === "imagem" ? (
                <div className="flex items-center gap-3">
                  <img src={editando.imagem_url} alt="" className="h-12 rounded border border-gray-700" />
                  <div className="flex-1">
                    <Input
                      label="Link de destino (opcional)"
                      placeholder="https://..."
                      value={linkDestino}
                      onChange={(e) => setLinkDestino(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <p>AdSense · cliente {editando.ad_client} · slot {editando.ad_slot}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                Para trocar a imagem ou o código do anúncio, exclua este banner e crie um novo.
              </p>
            </PreviewBox>
          ) : (
            <>
              <SegmentedControl
                options={[
                  { value: "imagem", label: "Imagem" },
                  { value: "adsense", label: "AdSense" },
                ]}
                value={tipoTab}
                onChange={setTipoTab}
              />

              {tipoTab === "imagem" ? (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      setArquivo(e.target.files[0] || null);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current && fileRef.current.click()}
                    className="w-full border-2 border-dashed border-gray-700 rounded-lg p-4 text-center text-gray-400 hover:border-blue-700 hover:text-gray-300 transition-colors"
                  >
                    {arquivo ? (
                      <span className="flex items-center justify-center gap-3">
                        <img src={URL.createObjectURL(arquivo)} alt="Prévia" className="h-12 rounded" />
                        <span className="text-gray-200 text-sm">{arquivo.name}</span>
                      </span>
                    ) : (
                      <span className="flex flex-col items-center gap-2">
                        <ImagePlus className="w-8 h-8 text-gray-600" />
                        <span className="text-sm">Clique para escolher a imagem (JPG, PNG, WEBP ou GIF até 5MB)</span>
                      </span>
                    )}
                  </button>
                  <div className="mt-3">
                    <Input
                      label="Link de destino (opcional)"
                      placeholder="https://..."
                      value={linkDestino}
                      onChange={(e) => setLinkDestino(e.target.value)}
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    Dica: use imagens em faixa (ex: 728x90 ou 320x50) — o banner tem 90px de altura.
                  </p>
                </div>
              ) : (
                <div>
                  <Textarea
                    label="Cole o código do bloco de anúncio (painel do AdSense)"
                    rows={5}
                    placeholder={'<ins class="adsbygoogle" data-ad-client="ca-pub-..." data-ad-slot="..." ...></ins>'}
                    value={adCodigo}
                    onChange={(e) => setAdCodigo(e.target.value)}
                    className="font-mono text-xs"
                  />
                  {adParsed && adParsed.error && (
                    <div className="mt-3">
                      <Alert variant="error" theme="dark">{adParsed.error}</Alert>
                    </div>
                  )}
                  {adParsed && !adParsed.error && (
                    <PreviewBox className="mt-3 space-y-1">
                      <p>Cliente: <span className="text-gray-200">{adParsed.ad_client}</span></p>
                      <p>Slot: <span className="text-gray-200">{adParsed.ad_slot}</span></p>
                      <p>
                        Formato:{" "}
                        <span className="text-gray-200">
                          {adParsed.ad_width
                            ? `${adParsed.ad_width}x${adParsed.ad_height} (fixo)`
                            : `${adParsed.ad_format || "auto"} (responsivo)`}
                        </span>
                      </p>
                    </PreviewBox>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    Prefira blocos horizontais (728x90, 320x50) — o banner tem 90px de altura. Em hotspots já
                    configurados, execute novamente o assistente do MikroTik para liberar os domínios do Google.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
