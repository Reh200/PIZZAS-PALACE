// 1. Configurações e Preços
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const lista = document.getElementById('lista-pedidos');
const totalElemento = document.getElementById('total-carrinho');
const foneWhatsapp = "5514991087543";

// Tabela de preços das bordas
const precosBordas = {
    "Nenhuma": 0,
    "Cheddar": 8.00,
    "Catupiry": 8.00,
    "Calabresa com catupiry": 14.00,
    "4 Queijo": 14.00,
    "Chocolate": 12.00,
    "Doce de Leite": 12.00
};

// 2. Função para Exibir o Carrinho na Tela
function exibirCarrinho() {
    if (!lista) return;
    lista.innerHTML = '';
    let totalGeral = 0;

    if (carrinho.length === 0) {
        lista.innerHTML = '<p class="text-center">Seu carrinho está vazio. 🍕</p>';
        if (totalElemento) totalElemento.innerText = "Total: R$ 0,00";
        return;
    }

    carrinho.forEach((item, index) => {
        // Cálculo do preço: Pizza + Borda
        const valorBorda = precosBordas[item.borda] || 0;
        const precoUnitarioTotal = item.preco + valorBorda;
        const subtotal = precoUnitarioTotal * item.quantidade;
        totalGeral += subtotal;

        lista.innerHTML += `
            <div class="pedido border-bottom p-3 d-flex justify-content-between align-items-center">
                <div>
                    <strong class="fs-5">${item.nome}</strong><br>
                    <span class="badge bg-secondary">Borda: ${item.borda || 'Padrão'}</span><br>
                    <small class="text-muted">
                        Un: R$ ${precoUnitarioTotal.toFixed(2).replace('.', ',')} | 
                        Qtd: ${item.quantidade}
                    </small>
                </div>
                <div class="text-end">
                    <div class="fw-bold mb-2">R$ ${subtotal.toFixed(2).replace('.', ',')}</div>
                    <button class="btn btn-sm btn-outline-danger" onclick="removerItem(${index})">
                        <i class="bi bi-trash"></i> Remover
                    </button>
                </div>
            </div>`;
    });

    if (totalElemento) {
        totalElemento.innerText = `Total: R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    }
}

// 3. Função para Remover Item
function removerItem(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

// 4. Função para Finalizar e Enviar para o WhatsApp
function finalizarPedido() {
    const enderecoElemento = document.getElementById('endereco');
    const endereco = enderecoElemento ? enderecoElemento.value : "";

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    if (!endereco) {
        alert("Por favor, informe o endereço de entrega!");
        return;
    }

    let mensagem = "*PEDIDO CHEFE EXPRESS*%0A%0A";
    let totalFinal = 0;

    carrinho.forEach(item => {
        const valorBorda = precosBordas[item.borda] || 0;
        const precoComBorda = item.preco + valorBorda;
        const subtotal = precoComBorda * item.quantidade;
        totalFinal += subtotal;

        mensagem += `*${item.quantidade}x ${item.nome}*%0A`;
        mensagem += `+ Borda: ${item.borda || 'Padrão'}%0A`;
        mensagem += `Subtotal: R$ ${subtotal.toFixed(2)}%0A%0A`;
    });

    mensagem += `--------------------------%0A`;
    mensagem += `*TOTAL: R$ ${totalFinal.toFixed(2)}*%0A%0A`;
    mensagem += `*Endereço:* ${endereco}`;

    // Limpeza e Redirecionamento
    localStorage.removeItem('carrinho');
    window.location.href = `https://wa.me/${foneWhatsapp}?text=${mensagem}`;
}

// 5. Inicialização
document.addEventListener('DOMContentLoaded', exibirCarrinho);