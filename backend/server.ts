import 'dotenv/config';
import cors from 'cors';
import express, { type Router } from 'express';

/* eslint-disable @typescript-eslint/no-require-imports */
const authRoutes: Router = require('./src/routes/authRoutes');
const planRoutes: Router = require('./src/routes/planRoutes');
const adminRoutes: Router = require('./routes/admin');
const mikrotikRoutes: Router = require('./src/routes/mikrotikRoutes');
const efiRoutes: Router = require('./src/routes/efiRoutes');
const mercadoPagoRoutes: Router = require('./src/routes/mercadoPagoRoutes');
const planPublicRoutes: Router = require('./src/routes/planPublicRoutes');
const pagamentoRoutes: Router = require('./src/routes/pagamentoRoutes');
const radiusRoutes: Router = require('./src/routes/radiusRoutes');
const dashboardRoutes: Router = require('./src/routes/dashboardRoutes');
const lgpdRoutes: Router = require('./src/routes/lgpdRoutes');
const whatsappRoutes: Router = require('./src/routes/whatsappRoutes');
const authTempRoutes: Router = require('./src/routes/authTempRoutes');
const limpezaRoutes: Router = require('./src/routes/limpezaRoutes');
/* eslint-enable @typescript-eslint/no-require-imports */

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/planos', planRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mikrotiks', mikrotikRoutes);
app.use('/api/efi', efiRoutes);
app.use('/api/config-mercadopago', mercadoPagoRoutes);
app.use('/api/planos-publicos', planPublicRoutes);
app.use('/api/pagamentos', pagamentoRoutes);
app.use('/api/radius', radiusRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lgpd', lgpdRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/auth', authTempRoutes);
app.use('/api/limpeza', limpezaRoutes);

const PORT = Number(process.env['PORT']) || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});

export default app;
