document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("bookingForm");
  const responseDiv = document.getElementById("response");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Mostrar estado de carregamento
    responseDiv.style.display = "block";
    responseDiv.innerHTML = '<div class="loading-spinner"></div><p>Enviando agendamento...</p>';
    responseDiv.className = "loading";

    // Coletar dados do formulário
    const formData = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      telefone: document.getElementById("telefone").value,
      plano: document.getElementById("plano").value,
      data: document.getElementById("data").value,
      horario: document.getElementById("horario").value,
      esporte: document.getElementById("esporte").value,
      local: document.getElementById("local").value
    };

    try {


      await new Promise(resolve => setTimeout(resolve, 1500));


      const dataFormatada = new Date(formData.data).toLocaleDateString('pt-BR');

      // Criar mensagem de sucesso
      const mensagem = `
              <div class="success-message">
                  <h3>Agendamento confirmado!</h3>
                  <p>Olá <strong>${formData.nome}</strong>, seu agendamento para <strong>${formData.esporte}</strong> foi realizado com sucesso!</p>
                  <div class="agendamento-info">
                      <p><strong>Data:</strong> ${dataFormatada} às ${formData.horario}</p>
                      <p><strong>Local:</strong> ${formData.local}</p>
                      <p><strong>Plano:</strong> ${formData.plano}</p>
                      <p>Um e-mail de confirmação foi enviado para: <strong>${formData.email}</strong></p>
                  </div>
              </div>
          `;

      // Exibir mensagem de sucesso
      responseDiv.className = "success";
      responseDiv.innerHTML = mensagem;

      // Rolagem suave para a mensagem
      responseDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Limpar formulário (opcional)
      form.reset();

    } catch (error) {
      console.error("Erro:", error);

      // Mensagem de erro
      responseDiv.className = "error";
      responseDiv.innerHTML = `
              <div class="error-message">
                  <h3>Erro no agendamento</h3>
                  <p>Ocorreu um erro ao processar seu agendamento. Por favor, tente novamente.</p>
                  <p>Detalhes: ${error.message}</p>
              </div>
          `;
    }
    // Executa uma função após um delay em milissegundos
    setTimeout(function () {
      window.location.href = "inicial.html";
    }, 3000); // 2000 milissegundos = 2 segundos

  });

  // Adicionar máscara para telefone (opcional)
  const telefoneInput = document.getElementById("telefone");
  telefoneInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    // Formatar como (XX) XXXXX-XXXX
    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }
    if (value.length > 10) {
      value = `${value.substring(0, 10)}-${value.substring(10)}`;
    }

    e.target.value = value;
  });

});

// Inicializa o mapa
const map = L.map('map').setView([-23.5505, -46.6333], 13); // Coordenadas iniciais
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Adiciona marcador clicável
let marker;
map.on('click', (e) => {
  if (marker) map.removeLayer(marker);
  marker = L.marker(e.latlng).addTo(map);

  // Preenche os campos ocultos
  document.getElementById('latitude').value = e.latlng.lat;
  document.getElementById('longitude').value = e.latlng.lng;

  // Usa Nominatim para pegar o endereço (API aberta)
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('local').value = data.display_name || "Endereço não encontrado";
    });
});

