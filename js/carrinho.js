let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const lista = document.getElementById('lista-pedidos');
const totalElemento = document.getElementById('total-carrinho');
const foneWhatsapp = "5514991087543";

// 1. Tabela de Preços (Sincronizada com o HTML)
const precosBordas = {
    "Nenhuma": 0, 
    "Cheddar": 8.00, 
    "Catupiry": 8.00,
    "Calabresa com catupiry": 14.00, 
    "4 Queijos": 14.00,
    "Chocolate": 12.00, 
    "Doce de Leite": 12.00,
    "Nutella": 13.00, 
    "Brigadeiro": 8.00 
};

const listaBebidas = ["Coca", "Suco", "Guaraná", "Fanta", "Sprite", "Água", "Cerveja"];

function verificarSeEhPizza(nome) {
    return !listaBebidas.some(bebida => nome.includes(bebida));
}

function exibirCarrinho() {
    if (!lista) return;
    lista.innerHTML = '';
    let totalGeral = 0;

    if (carrinho.length === 0) {
        lista.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"> <p>Seu carrinho está vazio 🍕</p> </div>';
        if (totalElemento) totalElemento.innerText = "R$ 0,00";
        return;
    }

    carrinho.forEach((item, index) => {
        const isPizza = verificarSeEhPizza(item.nome);
        const valorBorda = isPizza ? (precosBordas[item.borda] || 0) : 0;
        const subtotal = (item.preco + valorBorda) * item.quantidade;
        totalGeral += subtotal;

        let seletorBordaHTML = "";
        if (isPizza) {
            seletorBordaHTML = `
                <select class="form-select-sm" onchange="atualizarBorda(${index}, this.value)">
                    <option value="Nenhuma" ${item.borda === 'Nenhuma' ? 'selected' : ''}>Sem Borda</option>
                    <option value="4 Queijos" ${item.borda === '4 Queijos' ? 'selected' : ''}>4 Queijos (+R$ 14,00)</option>
                    <option value="Brigadeiro" ${item.borda === 'Brigadeiro' ? 'selected' : ''}>Brigadeiro (+R$ 8,00)</option>
                    <option value="Cheddar" ${item.borda === 'Cheddar' ? 'selected' : ''}>Cheddar (+R$ 8,00)</option>
                    <option value="Catupiry" ${item.borda === 'Catupiry' ? 'selected' : ''}>Catupiry (+R$ 8,00)</option>
                    <option value="Nutella" ${item.borda === 'Nutella' ? 'selected' : ''}>Nutella (+R$ 13,00)</option>
                    <option value="Chocolate" ${item.borda === 'Chocolate' ? 'selected' : ''}>Chocolate (+R$ 12,00)</option>
                </select>`;
        }

        lista.innerHTML += `
            <div class="item-pedido">
                <div class="info-item">
                    <strong>${item.nome}</strong>
                    ${seletorBordaHTML}
                </div>
                <div class="controles-item" style="text-align: right;">
                    <div class="preco-subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</div>
                    <div class="btn-group">
                        <button onclick="alterarQuantidade(${index}, -1)">-</button>
                        <span>${item.quantidade}</span>
                        <button onclick="alterarQuantidade(${index}, 1)">+</button>
                    </div>
                    <button class="btn-remover" onclick="removerItem(${index})">remover</button>
                </div>
            </div>`;
    });

    if (totalElemento) totalElemento.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}

function gerenciarPagamento() {
    const selecionados = document.querySelectorAll('input[name="metodo"]:checked');
    const boxTroco = document.getElementById('box-troco');

    if (selecionados.length > 2) {
        alert("Escolha no máximo 2 formas de pagamento!");
        if (event) event.target.checked = false;
        return;
    }

    const temDinheiro = Array.from(selecionados).some(el => el.value === 'Dinheiro');
    if (boxTroco) boxTroco.style.display = temDinheiro ? 'block' : 'none';
}

function alterarQuantidade(index, mudanca) {
    carrinho[index].quantidade += mudanca;
    if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1);
    salvar();
}
function atualizarBorda(index, novaBorda) {
    carrinho[index].borda = novaBorda;
    salvar();
}
function removerItem(index) {
    carrinho.splice(index, 1);
    salvar();
}
function removerTodos() {
    if (confirm("Deseja realmente esvaziar o carrinho?")) {
        carrinho = [];
        salvar();
    }
}
function salvar() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

// --- LÓGICA DE FINALIZAÇÃO PROFISSIONAL ---

async function finalizarPedido() {
    const endereco = document.getElementById('endereco').value;
    const telefone = document.getElementById('telefone').value;
    const selecionados = document.querySelectorAll('input[name="metodo"]:checked');
    const troco = document.getElementById('troco').value;
    const btn = document.getElementById('btn-finalizar');

    if (carrinho.length === 0) return alert("Seu carrinho está vazio!");
    if (!endereco || !telefone) return alert("Preencha o endereço e o telefone de contato!");
    if (selecionados.length === 0) return alert("Selecione uma forma de pagamento!");

    const metodos = Array.from(selecionados).map(el => el.value);
    
    // Identifica se vai para o Mercado Pago ou direto para o WhatsApp
    const pagamentoOnline = metodos.some(m => m === 'Pix' || m === 'Cartão de Crédito' || m === 'Cartão de Débito');

    if (pagamentoOnline) {
        try {
            btn.innerText = "⏳ Processando...";
            btn.disabled = true;

            const itensParaPagamento = carrinho.map(item => {
                const valorBorda = verificarSeEhPizza(item.nome) ? (precosBordas[item.borda] || 0) : 0;
                return {
                    nome: `${item.quantidade}x ${item.nome} (${item.borda || 'S/ Borda'})`,
                    precoTotal: parseFloat((item.preco + valorBorda).toFixed(2)), // Garante precisão decimal
                    quantidade: parseInt(item.quantidade)
                };
            });

            const response = await fetch('http://localhost:3000/criar-preferencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itens: itensParaPagamento })
            });

            const data = await response.json();

            if (data.init_point) {
                // SALVAMOS OS DADOS NO STORAGE PARA O WHATSAPP DEPOIS DO PAGAMENTO
                localStorage.setItem('ultimo_pedido', JSON.stringify({ metodos, endereco, troco, telefone }));
                window.location.href = data.init_point;
            } else {
                alert("Erro ao conectar com Mercado Pago. Tente Dinheiro ou Cartão na Entrega.");
                console.error("Erro MP:", data);
            }
        } catch (error) {
            alert("Servidor de pagamentos offline. Verifique o terminal!");
        } finally {
            btn.innerText = "Finalizar Pedido 🍕";
            btn.disabled = false;
        }
    } else {
        // Se for dinheiro ou cartão na maquininha, vai direto pro Zap
        enviarPedidoWhatsapp(metodos, endereco, troco, telefone);
    }
}

function enviarPedidoWhatsapp(metodos, endereco, troco, telefone) {
    let mensagem = `*🍕 NOVO PEDIDO - CHEFE EXPRESS* %0A%0A`;
    let totalGeral = 0;

    carrinho.forEach(item => {
        const valorBorda = verificarSeEhPizza(item.nome) ? (precosBordas[item.borda] || 0) : 0;
        const sub = (item.preco + valorBorda) * item.quantidade;
        totalGeral += sub;
        
        mensagem += `✅ *${item.quantidade}x ${item.nome}*%0A`;
        if (verificarSeEhPizza(item.nome)) mensagem += `   _Borda: ${item.borda || 'Nenhuma'}_%0A`;
        mensagem += `   Sub: R$ ${sub.toFixed(2).replace('.', ',')}%0A%0A`;
    });

    mensagem += `----------------------------%0A`;
    mensagem += `*💰 TOTAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}*%0A`;
    mensagem += `*📍 ENTREGA:* ${endereco}%0A`;
    mensagem += `*📱 CONTATO:* ${telefone}%0A`;
    mensagem += `*💳 PAGAMENTO:* ${metodos.join(" + ")}%0A`;

    if (metodos.includes('Dinheiro') && troco) {
        mensagem += `*💵 TROCO PARA:* R$ ${troco}%0A`;
    }

    window.open(`https://wa.me/${foneWhatsapp}?text=${mensagem}`, '_blank');
    
    // Opcional: Esvaziar o carrinho após enviar
    // localStorage.removeItem('carrinho');
}

document.addEventListener('DOMContentLoaded', exibirCarrinho);