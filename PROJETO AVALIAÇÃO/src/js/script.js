// Dados dos instrutores
const instrutores = [
    { 
        id: 1, 
        nome: "Carlos Silva", 
        foto: "instrutor1.jpg", 
        especialidade: "Carro",
        avaliacoes: [] 
    },
    { 
        id: 2, 
        nome: "Ana Oliveira", 
        foto: "instrutor2.jpg", 
        especialidade: "Moto",
        avaliacoes: [] 
    },
    { 
        id: 3, 
        nome: "Roberto Santos", 
        foto: "instrutor3.jpg", 
        especialidade: "Carro e Caminhão",
        avaliacoes: [] 
    },
    { 
        id: 4, 
        nome: "Mariana Costa", 
        foto: "instrutor4.jpg", 
        especialidade: "Carro",
        avaliacoes: [] 
    }
];

// Carrega os instrutores na página
document.addEventListener('DOMContentLoaded', function() {
    carregarInstrutores();
    
    // Configura as estrelas de avaliação
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            const ratingDiv = this.parentElement;
            const inputHidden = ratingDiv.querySelector('input[type="hidden"]');
            
            inputHidden.value = value;
            
            // Ativa as estrelas até o valor clicado
            ratingDiv.querySelectorAll('.star').forEach((s, index) => {
                if (index < value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
});

// Carrega os instrutores no grid
function carregarInstrutores() {
    const grid = document.getElementById('instrutoresContainer');
    grid.innerHTML = '';
    
    instrutores.forEach(instrutor => {
        const card = document.createElement('div');
        card.className = 'instrutor-card';
        
        // Calcula a média das avaliações
        const media = calcularMediaInstrutor(instrutor);
        
        card.innerHTML = `
            <img src="img/${instrutor.foto}" alt="${instrutor.nome}" loading="lazy">
            <div class="instrutor-info">
                <h3>${instrutor.nome}</h3>
                <p>${instrutor.especialidade}</p>
                ${media ? `<p class="media-avaliacao">Média: ${media.toFixed(1)}/5</p>` : '<p class="media-avaliacao">Sem avaliações</p>'}
                <p>${instrutor.avaliacoes.length} avaliação${instrutor.avaliacoes.length !== 1 ? 's' : ''}</p>
            </div>
        `;
        
        card.addEventListener('click', () => selecionarInstrutor(instrutor));
        grid.appendChild(card);
    });
}

// Calcula a média de um instrutor
function calcularMediaInstrutor(instrutor) {
    if (instrutor.avaliacoes.length === 0) return 0;
    
    let total = 0;
    let count = 0;
    
    instrutor.avaliacoes.forEach(avaliacao => {
        total += avaliacao.didatica + avaliacao.paciencia + avaliacao.pontualidade;
        count += 3;
    });
    
    return total / count;
}

// Seleciona um instrutor para avaliação
function selecionarInstrutor(instrutor) {
    document.querySelector('.instrutores').style.display = 'none';
    document.getElementById('formAvaliacao').style.display = 'block';
    document.getElementById('nomeInstrutor').textContent = instrutor.nome;
    document.getElementById('instrutorId').value = instrutor.id;
    document.getElementById('instrutorNome').value = instrutor.nome;
    
    // Resetar avaliações
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
    document.querySelectorAll('.rating input[type="hidden"]').forEach(input => {
        input.value = 0;
    });
    
    document.getElementById('comentario').value = '';
    document.getElementById('nomeAluno').value = '';
    document.getElementById('mensagemStatus').textContent = '';
    document.getElementById('mensagemStatus').className = 'mensagem-status';
}

// Envia a avaliação
document.getElementById('formularioAvaliacao').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const botao = this.querySelector('button');
    const textoOriginal = botao.textContent;
    const mensagemStatus = document.getElementById('mensagemStatus');
    
    // Validar
    const didatica = parseInt(document.getElementById('didatica').value);
    const paciencia = parseInt(document.getElementById('paciencia').value);
    const pontualidade = parseInt(document.getElementById('pontualidade').value);
    
    if (!didatica || !paciencia || !pontualidade) {
        mensagemStatus.textContent = 'Por favor, avalie todos os critérios';
        mensagemStatus.className = 'mensagem-status erro';
        return;
    }
    
    // Preparar dados
    const formData = {
        instrutorId: document.getElementById('instrutorId').value,
        instrutorNome: document.getElementById('instrutorNome').value,
        didatica: didatica,
        paciencia: paciencia,
        pontualidade: pontualidade,
        comentario: document.getElementById('comentario').value,
        nomeAluno: document.getElementById('nomeAluno').value || 'Anônimo'
    };
    
    // Enviar via Netlify Function
    botao.disabled = true;
    botao.textContent = 'Enviando...';
    mensagemStatus.textContent = '';
    
    try {
        const response = await fetch('/api/salvar-avaliacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro ao enviar avaliação');
        }
        
        // Atualizar localmente
        const instrutor = instrutores.find(i => i.id == formData.instrutorId);
        if (instrutor) {
            instrutor.avaliacoes.push({
                didatica: formData.didatica,
                paciencia: formData.paciencia,
                pontualidade: formData.pontualidade,
                comentario: formData.comentario,
                nomeAluno: formData.nomeAluno
            });
        }
        
        document.getElementById('formAvaliacao').style.display = 'none';
        document.getElementById('agradecimento').style.display = 'block';
        
    } catch (error) {
        console.error('Erro:', error);
        mensagemStatus.textContent = error.message || 'Erro ao enviar. Tente novamente.';
        mensagemStatus.className = 'mensagem-status erro';
    } finally {
        botao.disabled = false;
        botao.textContent = textoOriginal;
    }
});

function voltarParaInstrutores() {
    document.getElementById('agradecimento').style.display = 'none';
    document.querySelector('.instrutores').style.display = 'block';
    carregarInstrutores();
}