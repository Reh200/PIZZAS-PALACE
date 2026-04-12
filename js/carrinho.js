let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const lista = document.getElementById('lista-pedidos');
const totalElemento = document.getElementById('total-carrinho');
const foneWhatsapp = "5514991087543";

const precosBordas = {
    "Nenhuma": 0, "Cheddar": 8.00, "Catupiry": 8.00,
    "Calabresa com catupiry": 14.00, "4 Queijos": 14.00,
    "Chocolate": 12.00, "Doce de Leite": 12.00,
    "Brigadeiro": 8.00, "Nutella": 13.00
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
        lista.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Carrinho vazio.</p>';
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

// --- FINALIZAR PEDIDO ---
async function finalizarPedido() {
    const endereco = document.getElementById('endereco').value;
    const telefone = document.getElementById('telefone').value;
    const selecionados = document.querySelectorAll('input[name="metodo"]:checked');
    const troco = document.getElementById('troco').value;

    if (carrinho.length === 0) return alert("Carrinho vazio!");
    if (!endereco || !telefone) return alert("Por favor, informe endereço e telefone para entrega.");
    if (selecionados.length === 0) return alert("Escolha uma forma de pagamento.");
    
    // Validação do CPF
    const cpf = document.getElementById('cpf').value;
    if (!cpf || cpf.replace(/[^\d]+/g, '').length !== 11) {
        alert("Por favor, insira um CPF válido (11 números) para prosseguir.");
        document.getElementById('cpf').focus();
        return;
    }

    const metodos = Array.from(selecionados).map(el => el.value);
    const precisaDeLink = metodos.some(m => m === 'Pix' || m === 'Cartão de Crédito');

    let linkPagamento = "";
    let preferenciaId = "";

    if (precisaDeLink) {
        try {
            const itensFormatados = carrinho.map(item => {
                const valorBorda = verificarSeEhPizza(item.nome) ? (precosBordas[item.borda] || 0) : 0;
                return {
                    nome: item.nome + (item.borda !== 'Nenhuma' ? ` (Borda ${item.borda})` : ''),
                    precoTotal: (item.preco + valorBorda),
                    quantidade: item.quantidade
                };
            });

            const response = await fetch('http://localhost:3000/criar-preferencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itens: itensFormatados })
            });

            const data = await response.json();
            preferenciaId = data.id;
            linkPagamento = data.init_point;
        } catch (error) {
            console.error(error);
            return alert("Erro ao conectar com o servidor. O 'node server.js' está ativo?");
        }
    }

    // Gerar Botão do Mercado Pago
    if (preferenciaId) {
        const mp = new MercadoPago('APP_USR-dd7a8ab6-1870-4065-b1cc-d59ac9e1d6a9', { locale: 'pt-BR' });
        const bricksBuilder = mp.bricks();

        if (window.checkoutButton) window.checkoutButton.unmount();
        window.checkoutButton = await bricksBuilder.create("wallet", "walletBrick_container", {
            initialization: {
                preferenceId: preferenciaId,
                redirectMode: "modal"
            },
        });
        alert("Botão de pagamento gerado! Clique nele para concluir.");
    }

    // Mensagem WhatsApp
    let mensagem = "*🍕 NOVO PEDIDO - CHEFE EXPRESS*%0A%0A";
    let totalGeral = 0;

    carrinho.forEach(item => {
        const valorBorda = verificarSeEhPizza(item.nome) ? (precosBordas[item.borda] || 0) : 0;
        const sub = (item.preco + valorBorda) * item.quantidade;
        totalGeral += sub;
        mensagem += `✅ *${item.quantidade}x ${item.nome}*%0A`;
        if (verificarSeEhPizza(item.nome)) mensagem += `   _Borda: ${item.borda}_%0A`;
        mensagem += `   Sub: R$ ${sub.toFixed(2).replace('.', ',')}%0A%0A`;
    });

    mensagem += `----------------------------%0A`;
    mensagem += `*💰 TOTAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}*%0A%0A`;
    mensagem += `*📍 Endereço:* ${endereco}%0A`;
    mensagem += `*📱 Contato:* ${telefone}%0A%0A`;
    mensagem += `*💳 Pagamento:* ${metodos.join(", ")}%0A`;

    if (linkPagamento) mensagem += `%0A*🔗 LINK:* ${linkPagamento}%0A`;
    if (metodos.includes('Dinheiro') && troco) mensagem += `%0A*💵 Troco para:* R$ ${troco}`;

    localStorage.removeItem('carrinho');
    window.open(`https://wa.me/${foneWhatsapp}?text=${mensagem}`, '_blank');
}

// --- FUNÇÕES COMPLEMENTARES ---
function atualizarBorda(index, novaBorda) {
    carrinho[index].borda = novaBorda;
    salvar();
}

function alterarQuantidade(index, mudanca) {
    carrinho[index].quantidade += mudanca;
    if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1);
    salvar();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    salvar();
}

function removerTodos() {
    if (confirm("Deseja realmente esvaziar seu carrinho?")) {
        carrinho = [];
        salvar();
    }
}

function salvar() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

function gerenciarPagamento() {
    const selecionados = document.querySelectorAll('input[name="metodo"]:checked');
    const boxTroco = document.getElementById('box-troco');
    if (selecionados.length > 2) {
        alert("Você pode escolher no máximo 2 formas de pagamento!");
        event.target.checked = false;
        return;
    }
    const temDinheiro = Array.from(selecionados).some(el => el.value === 'Dinheiro');
    if (boxTroco) boxTroco.style.display = temDinheiro ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', exibirCarrinho);