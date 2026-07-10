import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Upload } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Textarea, Card } from "../ui";

export default function PerfilEmpresa() {
  const { updateEmpresaNome } = useAuth();
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [logoUrl, setLogoUrl] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("admin_token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get("/api/empresas/perfil", { headers })
      .then(res => {
        setForm({ nome: res.data?.nome || "", descricao: res.data?.descricao || "" });
        setLogoUrl(res.data?.logo_url || null);
      })
      .catch(err => console.error("Erro ao carregar perfil da empresa:", err));
  }, []);

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem(null);
    try {
      await axios.put("/api/empresas/perfil", form, { headers });
      updateEmpresaNome(form.nome);
      // Avisa o AdminLayout pra atualizar nome/descrição da sidebar sem recarregar
      window.dispatchEvent(new CustomEvent("empresa-perfil-atualizado", {
        detail: { nome: form.nome, descricao: form.descricao }
      }));
      setMensagem({ ok: true, texto: "Perfil atualizado com sucesso!" });
    } catch (err) {
      setMensagem({ ok: false, texto: "Erro ao salvar perfil." });
    } finally {
      setSalvando(false);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviandoLogo(true);
    setMensagem(null);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await axios.post("/api/empresas/perfil/logo", formData, { headers });
      setLogoUrl(res.data.logo_url);
      // Avisa o AdminLayout pra atualizar a logo da sidebar sem recarregar
      window.dispatchEvent(new CustomEvent("empresa-logo-atualizada", { detail: res.data.logo_url }));
      setMensagem({ ok: true, texto: "Logo atualizada com sucesso!" });
    } catch (err) {
      setMensagem({ ok: false, texto: "Erro ao enviar logo." });
    } finally {
      setEnviandoLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="p-6 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Perfil da Empresa</h2>
        <p className="text-sm text-gray-500">Nome, descrição e logo exibidos no painel e no captive portal.</p>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#0d1117] ring-2 ring-gray-700 flex items-center justify-center flex-shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo da empresa" className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-6 h-6 text-gray-600" />
          )}
        </div>
        <div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Upload}
            loading={enviandoLogo}
            onClick={() => fileInputRef.current?.click()}
          >
            Trocar logo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
          <p className="text-xs text-gray-600 mt-1">PNG, JPG, GIF, WEBP ou SVG — máx. 2MB.</p>
        </div>
      </div>

      <form onSubmit={salvar} className="space-y-4">
        <Input
          label="Nome da empresa"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />
        <Textarea
          label="Descrição"
          rows={3}
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          placeholder="Uma breve descrição da empresa (opcional)"
        />

        {mensagem && (
          <div className={`px-4 py-2 rounded-lg text-sm ${mensagem.ok ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
            {mensagem.texto}
          </div>
        )}

        <Button type="submit" variant="primary" loading={salvando}>
          Salvar
        </Button>
      </form>
    </Card>
  );
}
