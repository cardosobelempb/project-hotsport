require("dotenv").config();

const express = require("express");
const wppconnect = require("@wppconnect-team/wppconnect");
const { setClient } = require("./src/controllers/whatsappController");

const app = express();
const PORT = process.env.WHATSAPP_SERVER_PORT || 3030;
const WHATSAPP_SERVER_TOKEN = process.env.WHATSAPP_SERVER_TOKEN;

if (!WHATSAPP_SERVER_TOKEN) {
  console.error("❌ WHATSAPP_SERVER_TOKEN não está definido. Encerrando servidor.");
  process.exit(1);
}

app.use(express.json());

function maskPhone(telefone) {
  if (!telefone || String(telefone).length < 4) return "****";
  const str = String(telefone);
  return `****${str.slice(-4)}`;
}

function requireWhatsappToken(req, res, next) {
  const token = req.headers["x-whatsapp-token"];
  const timestamp = new Date().toISOString();
  if (token !== WHATSAPP_SERVER_TOKEN) {
    console.warn(`[${timestamp}] [/send] 401 Unauthorized - IP: ${req.ip}`);
    return res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }
  next();
}

let client = null;
let isClientReady = false;

async function iniciarWhatsapp() {
  console.log("🟡 Iniciando sessão WhatsApp...");

  try {
    client = await wppconnect.create({
      session: "hotspot-wpp",
      catchQR: (base64Qr, asciiQR) => {
        console.clear();
        console.log("📲 Escaneie o QR Code abaixo:");
        console.log(asciiQR);
      },
      statusFind: (statusSession) => {
        console.log("📶 Status:", statusSession);
      },
      puppeteerOptions: {
        headless: true,
        executablePath: "/usr/bin/google-chrome-stable",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      }
    });

    isClientReady = true;
    setClient(client); // 🔄 Exporta para o sistema principal
    console.log("✅ WhatsApp conectado!");
  } catch (err) {
    console.error("❌ Erro ao iniciar WhatsApp:", err);
  }
}

iniciarWhatsapp();

app.get("/status", (req, res) => {
  if (!isClientReady) return res.status(503).json({ status: "AGUARDANDO_CONEXAO" });
  res.json({ status: "CONECTADO" });
});

app.post("/send", requireWhatsappToken, async (req, res) => {
  const { telefone, mensagem } = req.body;
  const timestamp = new Date().toISOString();
  const maskedPhone = maskPhone(telefone);

  console.log(`[${timestamp}] [/send] Requisição recebida - Telefone: ${maskedPhone}`);

  if (!telefone || !mensagem) {
    return res.status(400).json({ error: "Telefone e mensagem são obrigatórios." });
  }

  if (!isClientReady) {
    return res.status(503).json({ error: "WhatsApp ainda não está pronto." });
  }

  try {
    await client.sendText(`${telefone}@c.us`, mensagem);
    console.log(`[${timestamp}] [/send] ✅ Mensagem enviada para ${maskedPhone}`);
    res.json({ sucesso: true, mensagem: "Enviado com sucesso." });
  } catch (err) {
    console.error(`[${timestamp}] [/send] ❌ Erro ao enviar para ${maskedPhone}:`, err);
    res.status(500).json({ error: "Falha ao enviar mensagem." });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`🚀 Servidor WhatsApp rodando em 127.0.0.1:${PORT}`);
});
