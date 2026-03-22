const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-5782943285494008-032213-3c7b8bc565060d52a05b36f851581033-3284167601'
});

app.post('/criar-preferencia', async (req, res) => {
  try {
    const preference = new Preference(client);

    // CRIANDO A PREFERÊNCIA COM A ESTRUTURA EXATA
    const result = await preference.create({
      body: {
        items: req.body.itens.map(item => ({
          title: String(item.nome),
          unit_price: Number(item.precoTotal),
          quantity: Number(item.quantidade || 1),
          currency_id: 'BRL'
        })),
        // O ERRO ESTAVA AQUI: Precisa ser 'back_urls' (com S)
        back_urls: {
          success: "http://127.0.0.1:5500/carrinho.html",
          failure: "http://127.0.0.1:5500/carrinho.html",
          pending: "http://127.0.0.1:5500/carrinho.html"
        },
        auto_return: "approved" // Só funciona se o success acima existir
      }
    });

    console.log("✅ SUCESSO! Link gerado:", result.init_point);
    res.json({ init_point: result.init_point });

  } catch (error) {
    console.log("❌ ERRO DETALHADO NO MERCADO PAGO:");
    // Isso vai te mostrar exatamente qual campo o Mercado Pago não gostou
    if (error.cause) {
        console.error(JSON.stringify(error.cause, null, 2));
    } else {
        console.error(error.message);
    }
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("=========================================");
  console.log("🔥 SERVIDOR CHEFE EXPRESS ATIVO - PORTA 3000");
  console.log("=========================================");
});