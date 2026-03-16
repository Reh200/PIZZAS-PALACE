let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const lista = document.getElementById('lista-pedidos');
const totalElemento = document.getElementById('total-carrinho');
const foneWhatsapp = "5514991087543";

const precosBordas = {
    "Nenhuma": 0, "Cheddar": 8.00, "Catupiry": 8.00,
    "Calabresa com catupiry": 14.00, "4 Queijo": 14.00,
    "Chocolate": 12.00, "Doce de Leite": 12.00
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
                    <option value="Cheddar" ${item.borda === 'Cheddar' ? 'selected' : ''}>Cheddar (+R$ 8,00)</option>
                    <option value="Catupiry" ${item.borda === 'Catupiry' ? 'selected' : ''}>Catupiry (+R$ 8,00)</option>
                    <option value="4 Queijo" ${item.borda === '4 Queijo' ? 'selected' : ''}>4 Queijos (+R$ 14,00)</option>
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
        alert("Máximo de 2 formas de pagamento!");
        event.target.checked = false;
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
    if (confirm("Esvaziar carrinho?")) {
        carrinho = [];
        salvar();
    }
}

function salvar() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

function finalizarPedido() {
    const endereco = document.getElementById('endereco').value;
    const selecionados = document.querySelectorAll('input[name="metodo"]:checked');
    const troco = document.getElementById('troco').value;

    if (carrinho.length === 0) return alert("Carrinho vazio!");
    if (!endereco) return alert("Informe o endereço!");
    if (selecionados.length === 0) return alert("Escolha o pagamento!");

    // Ajuste aqui: Cada pagamento em uma nova linha com um marcador
    const pagamentos = Array.from(selecionados)
        .map(el => `  - ${el.value}`)
        .join("%0A");

    let mensagem = "*NOVO PEDIDO - CHEFE EXPRESS*%0A%0A";
    let total = 0;

    carrinho.forEach(item => {
        const valorBorda = verificarSeEhPizza(item.nome) ? (precosBordas[item.borda] || 0) : 0;
        const sub = (item.preco + valorBorda) * item.quantidade;
        total += sub;
        mensagem += `*${item.quantidade}x ${item.nome}*%0A`;
        if (verificarSeEhPizza(item.nome)) {
            mensagem += `  - Borda: ${item.borda || 'Nenhuma'}%0A`;
        }
        mensagem += `  Sub: R$ ${sub.toFixed(2).replace('.', ',')}%0A%0A`;
    });

    mensagem += `*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*%0A%0A`;
    mensagem += `*Endereço:*%0A${endereco}%0A%0A`;
    mensagem += `*Forma de Pagamento:*%0A${pagamentos}`;
    
    if (Array.from(selecionados).some(el => el.value === 'Dinheiro') && troco) {
        mensagem += `%0A*Troco para:* R$ ${troco}`;
    }

    // Limpa o carrinho e envia
    localStorage.removeItem('carrinho');
    window.location.href = `https://wa.me/${foneWhatsapp}?text=${mensagem}`;
}

document.addEventListener('DOMContentLoaded', exibirCarrinho);