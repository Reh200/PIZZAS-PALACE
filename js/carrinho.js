let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const lista = document.getElementById('lista-pedidos');
const totalElemento = document.getElementById('total-carrinho');
const foneWhatsapp = "5514991087543";

// Preços de bordas
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

function toggleCpf() {
    const checkbox = document.getElementById('check-cpf');
    const inputCpf = document.getElementById('cpf');
    if (checkbox.checked) {
        inputCpf.disabled = false;
    } else {
        inputCpf.disabled = true;
        inputCpf.value = "";
    }
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

        lista.innerHTML += `
            <div class="item-pedido">
                <div class="info-item">
                    <strong>${item.quantidade}x ${item.nome}</strong>
                    ${isPizza ? `<br><small>Borda: ${item.borda}</small>` : ''}
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

function finalizarPedido() {
    const endereco = document.getElementById('endereco').value;
    const telefone = document.getElementById('telefone').value;
    const nome = document.getElementById('nome').value;
    const cpfChecked = document.getElementById('check-cpf').checked;
    const cpf = document.getElementById('cpf').value;
    const selecionados = document.querySelectorAll('input[name="metodo"]:checked');
    const troco = document.getElementById('troco').value;
    const obs = document.getElementById('obs') ? document.getElementById('obs').value : "";

    // Validações
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    if (!endereco || !telefone || !nome) return alert("Por favor, preencha nome, endereço e telefone.");
    if (selecionados.length === 0) return alert("Escolha uma forma de pagamento.");
    
    // Validação CPF Condicional
    if (cpfChecked && (cpf.replace(/[^\d]+/g, '').length !== 11)) {
        alert("Por favor, insira um CPF válido (11 números) ou desmarque a opção.");
        document.getElementById('cpf').focus();
        return;
    }

    const metodos = Array.from(selecionados).map(el => el.value);
    let mensagem = "*🍕 NOVO PEDIDO - CHEFE EXPRESS*%0A%0A";
    let totalGeral = 0;

    carrinho.forEach(item => {
        const valorBorda = verificarSeEhPizza(item.nome) ? (precosBordas[item.borda] || 0) : 0;
        const sub = (item.preco + valorBorda) * item.quantidade;
        totalGeral += sub;
        mensagem += `✅ *${item.quantidade}x ${item.nome}* ${item.borda !== 'Nenhuma' ? `(Borda ${item.borda})` : ''}%0A`;
        mensagem += `   Sub: R$ ${sub.toFixed(2).replace('.', ',')}%0A%0A`;
    });

    mensagem += `*💰 TOTAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}*%0A%0A`;
    mensagem += `*👤 Cliente:* ${nome}%0A*📍 Endereço:* ${endereco}%0A*📱 Contato:* ${telefone}%0A`;
    
    if (cpfChecked) mensagem += `*🆔 CPF:* ${cpf}%0A`;
    
    mensagem += `*💳 Pagamento:* ${metodos.join(", ")}%0A`;
    if (metodos.includes('Dinheiro') && troco) mensagem += `*💵 Troco para:* R$ ${troco}%0A`;
    if (obs) mensagem += `*📝 Obs:* ${obs}`;

    localStorage.removeItem('carrinho');
    window.open(`https://wa.me/${foneWhatsapp}?text=${mensagem}`, '_blank');
    location.reload(); // Recarrega para limpar a tela
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

function salvar() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

// Inicialização
document.addEventListener('DOMContentLoaded', exibirCarrinho);