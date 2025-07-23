document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const dropZone = document.querySelector('.drop-zone');
    const fileInput = document.getElementById('mediaFiles');
    const filePreview = document.getElementById('filePreview');
    const uploadForm = document.getElementById('uploadForm');
    const submitBtn = document.getElementById('submitBtn');
    const uploadsList = document.getElementById('uploadsList');

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
        dropZone.style.backgroundColor = 'rgba(231, 125, 0, 0.2)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.backgroundColor = 'rgba(231, 125, 0, 0.05)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = 'rgba(231, 125, 0, 0.05)';

        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFiles(e.dataTransfer.files);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    });

    // Form submit
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert('Por favor, selecione pelo menos um arquivo.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        try {
            await uploadFiles();
            alert('Arquivos enviados com sucesso!');
            selectedFiles = [];
            filePreview.innerHTML = '';
            fileInput.value = '';
            loadRecentUploads();
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Ocorreu um erro ao enviar os arquivos. Por favor, tente novamente.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Arquivos';
        }
    });

    // Função para lidar com os arquivos selecionados
    function handleFiles(files) {
        selectedFiles = Array.from(files);
        filePreview.innerHTML = '';

        selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';

            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                previewItem.appendChild(img);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.controls = true;
                previewItem.appendChild(video);
            } else {
                previewItem.textContent = file.name;
                previewItem.style.display = 'flex';
                previewItem.style.alignItems = 'center';
                previewItem.style.justifyContent = 'center';
                previewItem.style.backgroundColor = '#f0f0f0';
            }

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedFiles.splice(index, 1);
                handleFiles(selectedFiles);
            });

            previewItem.appendChild(removeBtn);
            filePreview.appendChild(previewItem);
        });
    }

    // Função para fazer upload dos arquivos
    async function uploadFiles() {
        const token = localStorage.getItem('token');

        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);

            // Determinar tipo baseado no arquivo
            const tipo = file.type.startsWith('image/') ? 'FOTO' : 'VIDEO';
            formData.append('tipo', tipo);

            // Adicionar ID do profissional se disponível
            const profissionalId = localStorage.getItem('userId');
            if (profissionalId) {
                formData.append('profissionalId', profissionalId);
            }

            const response = await fetch(`${API_BASE_URL}/galeria/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erro no upload: ${response.status}`);
            }
        }
    }

    // Função para carregar uploads recentes
    async function loadRecentUploads() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/galeria`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao carregar galeria: ${response.status}`);
            }

            const uploads = await response.json();
            displayUploads(uploads);

        } catch (error) {
            console.error('Erro ao carregar uploads:', error);
            uploadsList.innerHTML = '<p>Erro ao carregar uploads recentes.</p>';
        }
    }

    // Função para exibir uploads
    function displayUploads(uploads) {
        uploadsList.innerHTML = '';

        if (uploads.length === 0) {
            uploadsList.innerHTML = '<p>Nenhum upload encontrado.</p>';
            return;
        }

        uploads.forEach(upload => {
            const item = document.createElement('div');
            item.className = 'upload-item';

            if (upload.tipo === 'FOTO') {
                const img = document.createElement('img');
                img.src = upload.midiaUrl;
                img.alt = 'Foto da galeria';
                img.onerror = function () {
                    this.src = '/images/image-placeholder.png';
                };
                item.appendChild(img);
            } else {
                const video = document.createElement('video');
                video.src = upload.midiaUrl;
                video.controls = true;
                video.onerror = function () {
                    this.innerHTML = '<p>Erro ao carregar vídeo</p>';
                };
                item.appendChild(video);
            }

            const info = document.createElement('div');
            info.className = 'upload-item-info';
            info.innerHTML = `
                <h4>${upload.tipo}</h4>
                <p>${formatDate(upload.dataPostagem)}</p>
                <button class="delete-btn" onclick="deleteUpload(${upload.id})">Excluir</button>
            `;

            item.appendChild(info);
            uploadsList.appendChild(item);
        });
    }

    // Função para deletar upload
    window.deleteUpload = async function (id) {
        if (!confirm('Tem certeza que deseja excluir este item?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/galeria/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Item excluído com sucesso!');
                loadRecentUploads();
            } else {
                throw new Error(`Erro ao excluir: ${response.status}`);
            }
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir o item.');
        }
    };

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
});

