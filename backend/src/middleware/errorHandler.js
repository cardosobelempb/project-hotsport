// Error handler global (Express 5: rejeicoes de handlers async caem aqui automaticamente).
// Convencao para codigo novo: lancar Object.assign(new Error("mensagem PT-BR"), { status: 4xx })
// ou deixar o erro subir. Nunca expor err.message de erro interno (status >= 500) ao cliente.
module.exports = function errorHandler(err, req, res, next) {
  console.error(`[ERRO] ${req.method} ${req.originalUrl}:`, err);
  if (res.headersSent) return next(err);
  const status = Number.isInteger(err.status) ? err.status : 500;
  const msg = status < 500 && err.message ? err.message : "Erro interno do servidor";
  res.status(status).json({ error: msg });
};
