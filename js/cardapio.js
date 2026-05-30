let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function adicionarAoCarrinho(botao) {
    const itemElement = botao.closest('.item');
    
    // Captura a categoria (pizza ou bebida) definida no HTML
    const categoria = itemElement.getAttribute('data-categoria') || 'pizza';
    const nomeBase = itemElement.querySelector('strong').innerText;
    const select = itemElement.querySelector('.select-preco');
    const preco = parseFloat(select.value);
    const opcaoTexto = select.options[select.selectedIndex].text;

    // MELHORIA AQUI: Remove apenas o sufixo de preço " - R$ XX,XX" do texto da opção
    const detalheOpcao = opcaoTexto.split(/ - R\$/i)[0].trim();

    // Monta o nome final incluindo todos os detalhes (Sabor, tamanho, ml)
    const nomeFinal = `${nomeBase} (${detalheOpcao})`;

    // Verifica se já existe esse exato item (mesmo nome completo)
    const existente = carrinho.find(p => p.nome === nomeFinal);

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nomeFinal,
            preco: preco,
            quantidade: 1,
            categoria: categoria, // SALVA A CATEGORIA AQUI
            borda: "Nenhuma"      // Valor padrão
        });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    alert(`✅ ${nomeFinal} adicionado ao carrinho!`);
}

// ==========================================
// Script do botão "Voltar ao Topo"
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    // Seleciona o botão
    const backToTopBtn = document.getElementById("back-to-top-btn");

    // Monitora a rolagem da página
    window.onscroll = function() {
        if (backToTopBtn) {
            scrollFunction();
        }
    };

    function scrollFunction() {
        // Mostra o botão se a rolagem for maior que 300px
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    }
});

// Função chamada ao clicar no botão
function voltarAoTopo() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Rola suavemente até o topo
    });
}