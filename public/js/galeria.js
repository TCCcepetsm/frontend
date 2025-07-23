// URL base da API
const API_BASE_URL = 'https://psychological-cecilla-peres-7395ec38.koyeb.app/api';

// Carrega as imagens da galeria dinamicamente
document.addEventListener('DOMContentLoaded', async () => {
    await loadGaleria();
});

// Função para carregar a galeria
async function loadGaleria() {
    try {
        const response = await fetch(`${API_BASE_URL}/galeria`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar galeria: ${response.status}`);
        }

        const galeria = await response.json();
        displayGaleria(galeria);

    } catch (error) {
        console.error('Erro ao carregar galeria:', error);
        const container = document.getElementById('galeria');
        container.innerHTML = '<p class="error-message">Erro ao carregar a galeria. Tente novamente mais tarde.</p>';
    }
}

// Função para exibir a galeria
function displayGaleria(items) {
    const container = document.getElementById('galeria');
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p class="no-items">Nenhum item encontrado na galeria.</p>';
        return;
    }

    items.forEach(item => {
        const box = document.createElement('div');
        box.className = 'box';

        if (item.tipo === 'FOTO') {
            box.innerHTML = `
                <img src="${item.midiaUrl}" alt="Foto da galeria" onerror="this.src='/images/image-placeholder.png'">
                <h3>Foto</h3>
                <p class="date">${formatDate(item.dataPostagem)}</p>
            `;
        } else if (item.tipo === 'VIDEO') {
            box.innerHTML = `
                <video controls>
                    <source src="${item.midiaUrl}" type="video/mp4">
                    Seu navegador não suporta vídeos.
                </video>
                <h3>Vídeo</h3>
                <p class="date">${formatDate(item.dataPostagem)}</p>
            `;
        }

        // Adicionar evento de clique para abrir modal
        box.addEventListener('click', () => openModal(item));

        container.appendChild(box);
    });
}

// Função para abrir modal com a imagem/vídeo em tamanho maior
function openModal(item) {
    // Criar modal se não existir
    let modal = document.getElementById('galeriaModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'galeriaModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <div class="modal-media"></div>
                <div class="modal-info">
                    <h3></h3>
                    <p></p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Adicionar evento para fechar modal
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Fechar modal clicando fora do conteúdo
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Preencher conteúdo do modal
    const modalMedia = modal.querySelector('.modal-media');
    const modalInfo = modal.querySelector('.modal-info');

    if (item.tipo === 'FOTO') {
        modalMedia.innerHTML = `<img src="${item.midiaUrl}" alt="Foto da galeria">`;
    } else {
        modalMedia.innerHTML = `
            <video controls autoplay>
                <source src="${item.midiaUrl}" type="video/mp4">
                Seu navegador não suporta vídeos.
            </video>
        `;
    }

    modalInfo.querySelector('h3').textContent = item.tipo;
    modalInfo.querySelector('p').textContent = `Postado em: ${formatDate(item.dataPostagem)}`;

    // Mostrar modal
    modal.style.display = 'block';
}

// Função para filtrar por tipo
function filterByType(tipo) {
    const url = tipo ? `${API_BASE_URL}/galeria/tipo/${tipo}` : `${API_BASE_URL}/galeria`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao filtrar: ${response.status}`);
            }
            return response.json();
        })
        .then(galeria => {
            displayGaleria(galeria);
        })
        .catch(error => {
            console.error('Erro ao filtrar galeria:', error);
        });
}

// Função auxiliar para formatar data
function formatDate(dateString) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Adicionar botões de filtro se não existirem
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já existem botões de filtro
    if (!document.querySelector('.filter-buttons')) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-buttons';
        filterContainer.innerHTML = `
            <button onclick="filterByType('')" class="filter-btn active">Todos</button>
            <button onclick="filterByType('FOTO')" class="filter-btn">Fotos</button>
            <button onclick="filterByType('VIDEO')" class="filter-btn">Vídeos</button>
        `;

        // Inserir antes da galeria
        const galeria = document.getElementById('galeria');
        galeria.parentNode.insertBefore(filterContainer, galeria);

        // Adicionar estilos para os botões de filtro
        const style = document.createElement('style');
        style.textContent = `
            .filter-buttons {
                text-align: center;
                margin: 20px 0;
            }
            
            .filter-btn {
                background-color: #f0f0f0;
                border: 1px solid #ddd;
                padding: 10px 20px;
                margin: 0 5px;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .filter-btn:hover,
            .filter-btn.active {
                background-color: #e77d00;
                color: white;
                border-color: #e77d00;
            }
            
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.8);
            }
            
            .modal-content {
                position: relative;
                margin: 5% auto;
                padding: 20px;
                width: 90%;
                max-width: 800px;
                background-color: white;
                border-radius: 10px;
            }
            
            .close {
                position: absolute;
                top: 10px;
                right: 20px;
                font-size: 30px;
                font-weight: bold;
                cursor: pointer;
                color: #aaa;
            }
            
            .close:hover {
                color: #000;
            }
            
            .modal-media img,
            .modal-media video {
                width: 100%;
                height: auto;
                max-height: 500px;
                object-fit: contain;
            }
            
            .modal-info {
                text-align: center;
                margin-top: 15px;
            }
            
            .error-message,
            .no-items {
                text-align: center;
                padding: 40px;
                color: #666;
                font-size: 18px;
            }
            
            .date {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
    }
});

