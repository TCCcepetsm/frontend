// Configurações globais
const API_BASE_URL = 'https://psychological-cecilla-peres-7395ec38.koyeb.app/api';
const PLACEHOLDER_IMAGE = '../public/images/image-placeholder.png';

// Elementos da DOM
let galeriaContainer;
let modalInstance;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    initializeElements();
    createFilterButtons();
    await loadGaleria();
    injectStyles();
});

// Funções principais
function initializeElements() {
    galeriaContainer = document.getElementById('galeria');
    if (!galeriaContainer) {
        console.error('Container da galeria não encontrado');
        return;
    }
}

async function loadGaleria(tipo = '') {
    try {
        showLoadingState();

        // CORREÇÃO: Obter o token
        const token = window.auth.getToken();
        if (!token) {
            // Se não houver token, o usuário não está logado.
            // A função checkAuth em auth.js já deveria ter redirecionado, mas esta é uma segurança extra.
            showErrorState("Você precisa estar logado para ver a galeria.");
            return;
        }

        const url = tipo ? `${API_BASE_URL}/galeria/tipo/${tipo}` : `${API_BASE_URL}/galeria`;

        // CORREÇÃO: Adicionar o cabeçalho de autorização
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // <<-- CABEÇALHO ESSENCIAL
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const galeria = await response.json();
        displayGaleria(galeria);

    } catch (error) {
        console.error('Falha ao carregar galeria:', error);
        showErrorState();
    }
}


function displayGaleria(items) {
    galeriaContainer.innerHTML = '';

    if (!items || items.length === 0) {
        galeriaContainer.innerHTML = `
            <div class="empty-state">
                <p>Nenhum item encontrado na galeria.</p>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach(item => {
        const box = createGalleryItem(item);
        fragment.appendChild(box);
    });

    galeriaContainer.appendChild(fragment);
}

// Funções auxiliares
function createGalleryItem(item) {
    const box = document.createElement('div');
    box.className = 'gallery-item';
    box.setAttribute('data-type', item.tipo);

    let mediaContent = '';
    if (item.tipo === 'FOTO') {
        mediaContent = `<img src="${item.midiaUrl}" alt="Foto da galeria" onerror="this.src='${PLACEHOLDER_IMAGE}'">`;
    } else if (item.tipo === 'VIDEO') {
        mediaContent = `
            <div class="video-thumbnail">
                <video disablePictureInPicture>
                    <source src="${item.midiaUrl}#t=0.1" type="video/mp4">
                </video>
                <div class="play-icon"></div>
            </div>
        `;
    }

    box.innerHTML = `
        <div class="media-container">
            ${mediaContent}
        </div>
        <div class="item-info">
            <h3>${item.tipo === 'FOTO' ? 'Foto' : 'Vídeo'}</h3>
            <p class="date">${formatDate(item.dataPostagem)}</p>
        </div>
    `;

    box.addEventListener('click', () => openModal(item));
    return box;
}

function openModal(item) {
    if (!modalInstance) {
        createModal();
    }

    const modalMedia = modalInstance.querySelector('.modal-media');
    const modalInfo = modalInstance.querySelector('.modal-info');

    modalMedia.innerHTML = item.tipo === 'FOTO'
        ? `<img src="${item.midiaUrl}" alt="Foto em tamanho maior">`
        : `<video controls autoplay><source src="${item.midiaUrl}" type="video/mp4"></video>`;

    modalInfo.innerHTML = `
        <h3>${item.tipo === 'FOTO' ? 'Foto' : 'Vídeo'}</h3>
        <p>Postado em: ${formatDate(item.dataPostagem)}</p>
    `;

    modalInstance.style.display = 'block';
}

function createModal() {
    modalInstance = document.createElement('div');
    modalInstance.id = 'galeriaModal';
    modalInstance.className = 'modal';
    modalInstance.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="modal-media"></div>
            <div class="modal-info"></div>
        </div>
    `;

    modalInstance.querySelector('.close').addEventListener('click', () => {
        modalInstance.style.display = 'none';
        stopVideos();
    });

    modalInstance.addEventListener('click', (e) => {
        if (e.target === modalInstance) {
            modalInstance.style.display = 'none';
            stopVideos();
        }
    });

    document.body.appendChild(modalInstance);
}

function stopVideos() {
    document.querySelectorAll('video').forEach(video => {
        video.pause();
        video.currentTime = 0;
    });
}

function createFilterButtons() {
    if (document.querySelector('.filter-buttons')) return;

    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-buttons';
    filterContainer.innerHTML = `
        <button data-filter="" class="filter-btn active">Todos</button>
        <button data-filter="FOTO" class="filter-btn">Fotos</button>
        <button data-filter="VIDEO" class="filter-btn">Vídeos</button>
    `;

    filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            loadGaleria(e.target.dataset.filter);
        }
    });

    galeriaContainer.parentNode.insertBefore(filterContainer, galeriaContainer);
}

function injectStyles() {
    if (document.getElementById('galeria-styles')) return;

    const style = document.createElement('style');
    style.id = 'galeria-styles';
    style.textContent = `
        .gallery-item {
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        
        .gallery-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .media-container {
            position: relative;
            padding-top: 56.25%; /* 16:9 Aspect Ratio */
            overflow: hidden;
        }
        
        .media-container img,
        .media-container video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .video-thumbnail {
            position: relative;
            height: 100%;
        }
        
        .play-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            background-color: rgba(255,255,255,0.7);
            border-radius: 50%;
        }
        
        .play-icon::after {
            content: '';
            position: absolute;
            left: 55%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-width: 10px 0 10px 15px;
            border-style: solid;
            border-color: transparent transparent transparent #333;
        }
        
        .item-info {
            padding: 12px;
            background: white;
        }
        
        .item-info h3 {
            margin: 0 0 4px 0;
            font-size: 16px;
        }
        
        .date {
            margin: 0;
            font-size: 12px;
            color: #666;
        }
        
        /* Estilos do modal e filtros permanecem iguais ao anterior */
        ${document.getElementById('galeria-styles') ? '' : `
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
            background-color: #3498db; /* <<-- COR AZUL */
            color: white;
            border-color: #2980b9; /* <<-- COR AZUL MAIS ESCURA */
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
            
            .empty-state,
            .error-state {
                text-align: center;
                padding: 40px;
                color: #666;
                font-size: 18px;
            }
        `}
    `;

    document.head.appendChild(style);
}

function showLoadingState() {
    galeriaContainer.innerHTML = `
        <div class="loading-state">
            <p>Carregando galeria...</p>
        </div>
    `;
}

function showErrorState() {
    galeriaContainer.innerHTML = `
        <div class="error-state">
            <p>Erro ao carregar a galeria. Tente novamente mais tarde.</p>
        </div>
    `;
}

function formatDate(dateString) {
    if (!dateString) return 'Data não disponível';

    try {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    } catch (e) {
        console.error('Erro ao formatar data:', e);
        return dateString;
    }
}