const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const express = require('express');
const cors = require('cors');

const app = express();

// --- MIDDLEWARES ---
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO MERCADO PAGO ---
const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-2129731212136458-032216-814e094723899a2db10c359607026d87-3284167601'
});

// --- 1. ROTA PARA CRIAR PAGAMENTO (CHECKOUT PRO) ---
app.post('/criar-preferencia', async (req, res) => {
  try {
    const preference = new Preference(client);

    const body = {
      items: req.body.itens.map(item => ({
        title: String(item.nome),
        unit_price: Number(item.precoTotal),
        quantity: Number(item.quantity || item.quantidade || 1),
        currency_id: 'BRL'
      })),
      // Substitua o bloco antigo dentro de preference.create por este:
      back_urls: {
        // Use o link do ngrok que você copiou aqui:
        success: "https://SUA-URL-AQUI.ngrok-free.app/confirmacao.html",
        failure: "https://SUA-URL-AQUI.ngrok-free.app/carrinho.html",
        pending: "https://SUA-URL-AQUI.ngrok-free.app/carrinho.html"
      },
      auto_return: "approved",
      // Adicione esta linha também para o Mercado Pago avisar seu servidor:
      notification_url: "https://SUA-URL-AQUI.ngrok-free.app/webhooks",
      auto_return: "approved",
      // Opcional: Se você configurar o Ngrok, coloque a URL aqui
      // notification_url: "https://sua-url-ngrok.app/webhooks", 
    };

    const response = await preference.create({ body });

    console.log("=========================================");
    console.log("✅ NOVA PREFERÊNCIA GERADA");
    console.log("🆔 ID:", response.id);
    console.log("=========================================");

    res.json({
      id: response.id,
      init_point: response.init_point
    });

  } catch (error) {
    console.error("❌ ERRO AO CRIAR PREFERÊNCIA:");
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- 2. ROTA DE WEBHOOKS (NOTIFICAÇÕES EM TEMPO REAL) ---
app.post('/webhooks', async (req, res) => {
  try {
    const { body, query } = req;
    const paymentId = query['data.id'] || (body.data && body.data.id);
    const type = query.type || body.type;

    if (type === "payment" && paymentId) {
      console.log(`🔔 Notificação de pagamento recebida: ${paymentId}`);

      const payment = await new Payment(client).get({ id: paymentId });
      const status = payment.status;

      if (status === "approved") {
        console.log("💰 [CHEFE EXPRESS] PAGAMENTO APROVADO! Valor: R$", payment.transaction_amount);
        // Aqui você pode disparar a lógica de produção da pizza
      } else {
        console.log(`⚠️ Status do pagamento ${paymentId}: ${status}`);
      }
    }

    // Retornar sempre 200 ou 201 para o Mercado Pago
    res.sendStatus(200);

  } catch (error) {
    console.error("❌ Erro no processamento do Webhook:", error.message);
    res.sendStatus(500);
  }
});

// --- ROTA DE TESTE ---
app.get('/', (req, res) => {
  res.send("🚀 Servidor Chefe Express Online!");
});

// --- INICIALIZAÇÃO ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log("=========================================");
  console.log("🔥 CHEFE EXPRESS: BACKEND ATIVO");
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log("✅ Rotas disponíveis: /criar-preferencia e /webhooks");
  console.log("=========================================");
});