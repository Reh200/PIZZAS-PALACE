// Recupera carrinho do localStorage ou cria array vazio
let pedidos = JSON.parse(localStorage.getItem('carrinho')) || [];
const lista = document.getElementById('lista-pedidos');

// Adicionar item ao carrinho
function enviarPedido(botao, tipo) {
  const item = botao.closest('.item');
  const nome = item.querySelector('strong, h4').innerText;
  const precoTexto = item.querySelector('span, .preco').innerText;

  // Remove R$, espaços e troca vírgula por ponto
  const preco = parseFloat(precoTexto.replace('R$', '').replace(/\./g,'').replace(',', '.'));

  if (isNaN(preco)) {
    alert('Erro ao adicionar preço do item!');
    return;
  }

  const existente = pedidos.find(p => p.nome === nome);
  if (existente) {
    existente.quantidade += 1;
  } else {
    pedidos.push({ nome, preco, quantidade: 1 });
  }

  localStorage.setItem('carrinho', JSON.stringify(pedidos));
  exibirCarrinho();
  alert(`${nome} adicionado ao carrinho!`);
}

// Exibe itens no carrinho
function exibirCarrinho() {
  lista.innerHTML = '';
  if (pedidos.length === 0) {
    lista.innerHTML = "<p>Seu carrinho está vazio.</p>";
    return;
  }

  pedidos.forEach((pedido, index) => {
    const div = document.createElement('div');
    div.className = 'pedido';
    div.innerHTML = `
      <div>
        <strong>${pedido.nome}</strong>
        <p class="preco">R$ ${(pedido.preco * pedido.quantidade).toFixed(2).replace('.', ',')}</p>
      </div>
      <div class="qtd-controle">
        <button class="btn-qtd" onclick="alterarQtd(${index}, -1)">-</button>
        <span>${pedido.quantidade}</span>
        <button class="btn-qtd" onclick="alterarQtd(${index}, 1)">+</button>
      </div>
      <button class="btn-remover" onclick="removerItem(${index})">Remover</button>
    `;
    lista.appendChild(div);
  });
}

// Alterar quantidade
function alterarQtd(index, delta) {
  pedidos[index].quantidade += delta;
  if (pedidos[index].quantidade < 1) pedidos[index].quantidade = 1;
  localStorage.setItem('carrinho', JSON.stringify(pedidos));
  exibirCarrinho();
}

// Remover item
function removerItem(index) {
  pedidos.splice(index, 1);
  localStorage.setItem('carrinho', JSON.stringify(pedidos));
  exibirCarrinho();
}

// Remover todos
function removerTodos() {
  pedidos = [];
  localStorage.removeItem('carrinho');
  exibirCarrinho();
}

// Finalizar compra
function finalizarPedido() {
  if (pedidos.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  let mensagem = "Olá, gostaria de fazer o seguinte pedido:%0A";
  pedidos.forEach(p => {
    mensagem += `• ${p.nome} (x${p.quantidade}) - R$ ${(p.preco * p.quantidade).toFixed(2).replace('.', ',')}%0A`;
  });

  pedidos = [];
  localStorage.removeItem('carrinho');
  exibirCarrinho();

  const numero = '5514991087543';
  window.location.href = `https://wa.me/${numero}?text=${mensagem}`;
}

// Inicializa exibição
exibirCarrinho();
