document.addEventListener('DOMContentLoaded', function () {
    // Verificar autenticação primeiro
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Elementos do DOM
    const dropZone = document.querySelector('.drop-zone');
    const fileInput = document.getElementById('mediaFiles');
    const filePreview = document.getElementById('filePreview');
    const uploadForm = document.getElementById('uploadForm');
    const submitBtn = document.getElementById('submitBtn');
    const uploadsList = document.getElementById('uploadsList');
    const eventTypeSelect = document.getElementById('eventType');
    const eventDateInput = document.getElementById('eventDate');

    // Configurar data padrão como hoje
    eventDateInput.valueAsDate = new Date();

    // Array para armazenar os arquivos selecionados
    let selectedFiles = [];

    // URL base da API
    const API_BASE_URL = 'https://psychological-cecilla-peres-7395ec38.koyeb.app/api';

    // Carrega uploads recentes
    loadRecentUploads();

    // Event listeners para a área de drop
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drop-zone--active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drop-zone--active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drop-zone--active');

        if (e.dataTransfer.files.length) {
            handleFilesSelection(e.dataTransfer.files);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFilesSelection(fileInput.files);
        }
    });

    // Form submit
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';

            await uploadFiles();

            showAlert('success', 'Arquivos enviados com sucesso!');
            resetForm();
            loadRecentUploads();
        } catch (error) {
            console.error('Erro no upload:', error);
            showAlert('error', error.message || 'Erro ao enviar arquivos');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Arquivos';
        }
    });

    // Função para validar o formulário
    function validateForm() {
        if (selectedFiles.length === 0) {
            showAlert('error', 'Por favor, selecione pelo menos um arquivo.');
            return false;
        }

        if (!eventTypeSelect.value) {
            showAlert('error', 'Por favor, selecione o tipo de evento.');
            return false;
        }

        if (!eventDateInput.value) {
            showAlert('error', 'Por favor, informe a data do evento.');
            return false;
        }

        return true;
    }

    // Função para lidar com a seleção de arquivos
    function handleFilesSelection(files) {
        // Filtra apenas arquivos de imagem e vídeo
        selectedFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/') || file.type.startsWith('video/')
        );

        if (selectedFiles.length !== files.length) {
            showAlert('warning', 'Alguns arquivos não são imagens ou vídeos e foram ignorados.');
        }

        if (selectedFiles.length === 0) {
            filePreview.innerHTML = '<p class="no-files">Nenhum arquivo válido selecionado</p>';
            return;
        }

        renderFilePreviews();
    }

    // Função para renderizar pré-visualizações
    function renderFilePreviews() {
        filePreview.innerHTML = '';

        selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.dataset.index = index;

            const previewContent = document.createElement('div');
            previewContent.className = 'preview-content';

            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                previewContent.appendChild(img);
            } else {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.controls = true;
                previewContent.appendChild(video);
            }

            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            fileInfo.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            `;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedFiles.splice(index, 1);
                renderFilePreviews();
            });

            previewItem.appendChild(previewContent);
            previewItem.appendChild(fileInfo);
            previewItem.appendChild(removeBtn);
            filePreview.appendChild(previewItem);
        });
    }

    // Função para fazer upload dos arquivos
    async function uploadFiles() {
        const profissionalId = localStorage.getItem('userId');
        if (!profissionalId) {
            throw new Error('ID do profissional não encontrado');
        }

        const formData = new FormData();

        // Adiciona metadados
        formData.append('eventType', eventTypeSelect.value);
        formData.append('eventDate', eventDateInput.value);
        formData.append('profissionalId', profissionalId);

        // Adiciona todos os arquivos
        selectedFiles.forEach((file, index) => {
            formData.append(`files`, file);
        });

        const response = await fetch(`${API_BASE_URL}/galeria/upload-multiple`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro no upload');
        }
    }

    // Função para carregar uploads recentes
    async function loadRecentUploads() {
        try {
            showLoading(uploadsList, 'Carregando uploads recentes...');

            const response = await fetch(`${API_BASE_URL}/galeria`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) {
                throw new Error(`Erro ${response.status}`);
            }

            const uploads = await response.json();
            displayUploads(uploads);

        } catch (error) {
            console.error('Erro ao carregar uploads:', error);
            showError(uploadsList, 'Erro ao carregar uploads recentes');
        }
    }

    // Função para exibir uploads
    function displayUploads(uploads) {
        uploadsList.innerHTML = '';

        if (!uploads || uploads.length === 0) {
            uploadsList.innerHTML = '<p class="no-uploads">Nenhum upload encontrado</p>';
            return;
        }

        uploads.forEach(upload => {
            const item = document.createElement('div');
            item.className = 'upload-item';
            item.dataset.id = upload.id;

            const mediaContainer = document.createElement('div');
            mediaContainer.className = 'media-container';

            if (upload.tipo === 'FOTO') {
                const img = document.createElement('img');
                img.src = upload.midiaUrl;
                img.alt = 'Foto da galeria';
                img.loading = 'lazy';
                img.onerror = function () {
                    this.src = '/images/image-placeholder.png';
                };
                mediaContainer.appendChild(img);
            } else {
                const video = document.createElement('video');
                video.src = upload.midiaUrl;
                video.controls = true;
                video.preload = 'metadata';
                video.onerror = function () {
                    this.innerHTML = '<p>Vídeo não disponível</p>';
                };
                mediaContainer.appendChild(video);
            }

            const info = document.createElement('div');
            info.className = 'upload-info';
            info.innerHTML = `
                <div class="upload-meta">
                    <span class="upload-type">${upload.tipo}</span>
                    <span class="upload-date">${formatDate(upload.dataPostagem)}</span>
                </div>
                <div class="upload-event">
                    <span class="event-type">${upload.eventType || 'Sem tipo'}</span>
                    <span class="event-date">${formatDate(upload.eventDate)}</span>
                </div>
            `;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteUpload(upload.id));

            item.appendChild(mediaContainer);
            item.appendChild(info);
            item.appendChild(deleteBtn);
            uploadsList.appendChild(item);
        });
    }

    // Função para deletar upload
    async function deleteUpload(id) {
        if (!confirm('Tem certeza que deseja excluir este item permanentemente?')) {
            return;
        }

        try {
            const item = document.querySelector(`.upload-item[data-id="${id}"]`);
            if (item) item.classList.add('deleting');

            const response = await fetch(`${API_BASE_URL}/galeria/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}`);
            }

            // Anima a remoção do item
            if (item) {
                item.classList.add('deleted');
                setTimeout(() => {
                    loadRecentUploads();
                }, 500);
            } else {
                loadRecentUploads();
            }

            showAlert('success', 'Item excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir:', error);
            showAlert('error', 'Erro ao excluir o item');
        }
    }

    // Funções auxiliares
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]);
    }

    function showAlert(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        document.body.appendChild(alert);

        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 500);
        }, 3000);
    }

    function showLoading(container, message) {
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }

    function showError(container, message) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button onclick="location.reload()">Tentar novamente</button>
            </div>
        `;
    }

    function resetForm() {
        selectedFiles = [];
        filePreview.innerHTML = '';
        fileInput.value = '';
        eventTypeSelect.value = '';
        eventDateInput.valueAsDate = new Date();
    }
});