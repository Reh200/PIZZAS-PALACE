// Recupera o carrinho do localStorage ou inicializa como um array vazio
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Adicionar item ao carrinho
function enviarPedido(botao, categoria) {
  const item = botao.closest('.item');
  const nome = item.querySelector('strong, h4').innerText;
  const precoTexto = item.querySelector('span, .preco').innerText;

  // Converte preço para número
  const preco = parseFloat(precoTexto.replace('R$', '').replace(/\./g,'').replace(',', '.'));
  if (isNaN(preco)) {
    alert('Erro ao adicionar preço do item!');
    return;
  }

  // Verifica se já existe no carrinho
  const existente = carrinho.find(p => p.nome === nome);
  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({ nome, preco, quantidade: 1, categoria });
  }

  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  alert(`${nome} adicionado ao carrinho!`);
}

// Exibir carrinho (para página de visualização rápida, se houver)
function exibirCarrinho() {
  const listaCarrinho = document.getElementById('lista-carrinho');
  if (!listaCarrinho) return;

  listaCarrinho.innerHTML = '';
  if (carrinho.length === 0) {
    listaCarrinho.innerHTML = '<p>Seu carrinho está vazio.</p>';
    return;
  }

  carrinho.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'item-carrinho';
    div.innerHTML = `
      <strong>${item.nome}</strong>
      <p>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</p>
      <div class="qtd-controle">
        <button onclick="alterarQtd(${i}, -1)">-</button>
        <span>${item.quantidade}</span>
        <button onclick="alterarQtd(${i}, 1)">+</button>
      </div>
    `;
    listaCarrinho.appendChild(div);
  });
}

// Alterar quantidade de um item
function alterarQtd(index, delta) {
  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade < 1) carrinho[index].quantidade = 1;
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  exibirCarrinho();
}

// Finalizar compra
function finalizarCompra() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  let mensagem = "Olá! Gostaria de fazer o seguinte pedido:%0A";
  carrinho.forEach(item => {
    mensagem += `• ${item.nome} (x${item.quantidade}) - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')} (Categoria: ${item.categoria})%0A`;
  });

  carrinho = [];
  localStorage.removeItem('carrinho');
  exibirCarrinho();

  const numeroWhatsApp = "SEUNUMEROAQUI"; // coloque seu número
  const link = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
  window.open(link, '_blank');
}

// Inicializa exibição
window.onload = function() {
  exibirCarrinho();
};
