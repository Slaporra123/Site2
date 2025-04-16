// === Dados das Cartinhas (serão carregados do arquivo cards.json) ===
let cardsData = {};

// === Funções de Imagens dos Envelopes ===
function getClosedEnvelopeImage() {
    return 'https://i.postimg.cc/kD6PRzRK/Picsart-25-04-12-23-52-49-875.png';
}

function getOpenEnvelopeImage() {
    return 'https://i.postimg.cc/kDxwHvkL/Picsart-25-04-13-10-48-44-000.png';
}

// === Carrega os Dados das Cartinhas do Arquivo JSON ===
async function loadCardsData() {
    try {
        const response = await fetch('cards.json');
        cardsData = await response.json();
        populateCards();
    } catch (error) {
        console.error('Erro ao carregar os dados das cartinhas:', error);
        // Fallback caso o JSON não carregue
        cardsData = {
            'card-1': {
                title: 'Estiver Triste',
                text: 'Meu amor, sei que às vezes o dia pode ser pesado, mas estou aqui para te abraçar e te lembrar o quanto você é especial!',
                images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150/0000FF']
            },
            'card-2': {
                title: 'Estiver Feliz',
                text: 'Você está sorrindo, e isso ilumina meu mundo! Vamos celebrar juntos essa alegria!',
                images: ['https://via.placeholder.com/150/FF0000']
            },
            'card-3': {
                title: 'Precisar de um Abraço',
                text: 'Aqui vai um abraço virtual bem apertado! Te amo muito!',
                images: []
            },
            'card-4': {
                title: 'Quiser Rir',
                text: 'Aqui vai uma piadinha para te fazer sorrir: Por que o tomate não briga com ninguém? Porque ele é muito maduro!',
                images: ['https://via.placeholder.com/150/FFFF00']
            }
        };
        populateCards();
    }
}

// === Popula os Cartões Dinamicamente no HTML ===
function populateCards() {
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = ''; // Limpa qualquer conteúdo existente

    Object.keys(cardsData).forEach(cardId => {
        const cardData = cardsData[cardId];
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.id = cardId;
        cardElement.setAttribute('role', 'button');
        cardElement.setAttribute('aria-label', `Abrir quando ${cardData.title.toLowerCase()}`);
        cardElement.innerHTML = `
            <img src="${getClosedEnvelopeImage()}" alt="Envelope fechado">
            <h3>${cardData.title}</h3>
        `;
        cardsContainer.appendChild(cardElement);

        // Adiciona eventos de clique e teclado
        cardElement.addEventListener('click', () => {
            if (localStorage.getItem(`card-read-${cardId}`) !== 'true') {
                showConfirmModal(cardId);
            } else {
                openModal(cardId);
            }
        });
        cardElement.addEventListener('keypress', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (localStorage.getItem(`card-read-${cardId}`) !== 'true') {
                    showConfirmModal(cardId);
                } else {
                    openModal(cardId);
                }
            }
        });
    });

    loadCardStates();
}

// === Atualiza o Progresso de Envelopes Abertos ===
function updateProgress() {
    const totalCards = document.querySelectorAll('.card').length;
    const openedCards = Array.from(document.querySelectorAll('.card')).filter(card =>
        localStorage.getItem(`card-read-${card.id}`) === 'true'
    ).length;
    document.getElementById('progress').textContent = `${openedCards}/${totalCards} envelopes abertos`;
}

// === Carrega o Estado das Cartinhas (Aberta/Fechada) ===
function loadCardStates() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const img = card.querySelector('img');
        if (localStorage.getItem(`card-read-${card.id}`) === 'true') {
            img.src = getOpenEnvelopeImage();
            img.alt = 'Envelope aberto';
        } else {
            img.src = getClosedEnvelopeImage();
            img.alt = 'Envelope fechado';
        }
    });
    updateProgress();
}

// === Variável Global para Rastrear a Cartinha Atual ===
let currentCardId = null;

// === Exibe o Modal de Confirmação Antes de Abrir a Cartinha ===
function showConfirmModal(cardId) {
    currentCardId = cardId;
    const data = cardsData[cardId];
    if (!data) return;

    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    confirmMessage.textContent = `Essa cartinha deve ser aberta apenas quando você ${data.title.toLowerCase()}. Tem certeza que quer abrir?`;
    confirmModal.style.display = 'block';
}

// === Confirma a Abertura da Cartinha ===
function confirmOpenCard() {
    document.getElementById('confirm-modal').style.display = 'none';
    if (currentCardId) {
        openModal(currentCardId);
    }
}

// === Cancela a Abertura da Cartinha ===
function cancelOpenCard() {
    document.getElementById('confirm-modal').style.display = 'none';
    currentCardId = null;
}

// === Exibe a Animação de Abertura do Envelope ===
function openModal(cardId) {
    const envelopeAnimation = document.getElementById('envelope-animation');
    envelopeAnimation.style.display = 'flex';
    setTimeout(() => {
        envelopeAnimation.style.display = 'none';
        showModalContent(cardId);
    }, 1500);
}

// === Exibe o Conteúdo da Cartinha no Modal ===
function showModalContent(cardId) {
    const data = cardsData[cardId];
    if (!data) return;

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalText = document.getElementById('modalText');
    const modalImages = document.getElementById('modalImages');

    modalTitle.textContent = `Quando ${data.title}`;
    modalText.textContent = data.text;
    modalImages.innerHTML = '';
    data.images.forEach(link => {
        if (link) {
            const img = document.createElement('img');
            img.src = link;
            img.alt = 'Imagem decorativa';
            img.loading = 'lazy';
            modalImages.appendChild(img);
        }
    });

    if (localStorage.getItem(`card-read-${cardId}`) !== 'true') {
        localStorage.setItem(`card-read-${cardId}`, 'true');
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff69b4', '#fff']
        });
    }

    modal.style.display = 'block';
    updateProgress();
    loadCardStates();
}

// === Fecha o Modal da Cartinha e Verifica se Todas Foram Lidas ===
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';

    const totalCards = document.querySelectorAll('.card').length;
    const openedCards = Array.from(document.querySelectorAll('.card')).filter(card =>
        localStorage.getItem(`card-read-${card.id}`) === 'true'
    ).length;
    if (openedCards === totalCards) {
        document.getElementById('final-modal').style.display = 'block';
    }
}

// === Recomeça as Cartinhas (Reseta o Estado) ===
function resetCards() {
    const randomChance = Math.random();
    const playfulMessage = randomChance < 0.2
        ? 'Tem certeza? Você vai apagar todas as memórias fofas que já abriu... 😢'
        : 'Deseja recomeçar todas as cartinhas?';
    if (confirm(playfulMessage)) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('card-read-')) {
                localStorage.removeItem(key);
            }
        });
        loadCardStates();
    }
}

// === Fecha o Modal de Boas-Vindas ===
function closeWelcomeModal() {
    document.getElementById('welcome-modal').style.display = 'none';
}

// === Fecha o Modal Final ===
function closeFinalModal() {
    document.getElementById('final-modal').style.display = 'none';
}

// === Atualiza a Mensagem de Boas-Vindas com o Tempo Desde a Última Visita ===
function updateWelcomeMessage() {
    const lastVisitTimestamp = localStorage.getItem('lastVisit');
    const now = new Date();
    const currentTimestamp = now.getTime();
    let message = 'Estas cartinhas são um pedacinho do meu coração, para te fazer sorrir e sentir meu amor em cada momento.';

    // Easter egg: Random compliment (10% chance)
    const compliments = [
        'A propósito, você está ainda mais linda hoje! 💖',
        'Sabia que seu sorriso é a coisa mais fofa do mundo? 😊',
        'Você é o meu raio de sol, sabia? ☀️'
    ];
    if (Math.random() < 0.1) {
        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
        message += `<br><br>${randomCompliment}`;
    }

    // Verifica a última visita e adiciona mensagem de saudade ou viajante do tempo
    if (lastVisitTimestamp) {
        const lastVisit = new Date(parseInt(lastVisitTimestamp));
        const timeDiff = currentTimestamp - lastVisitTimestamp;
        
        // Easter egg: Time traveler message if current date is earlier than last visit
        if (timeDiff < 0) {
            message += `<br><br>A última vez que você entrou no site foi... amanhã?! Como assim? Você é uma viajante do tempo? 🕒`;
        } else {
            const daysSinceLastVisit = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            if (daysSinceLastVisit > 0) {
                message += `<br><br>Você não vinha aqui há ${daysSinceLastVisit} dia${daysSinceLastVisit > 1 ? 's' : ''}! Que saudade!`;
            } else {
                const hoursSinceLastVisit = Math.floor(timeDiff / (1000 * 60 * 60));
                if (hoursSinceLastVisit > 0) {
                    message += `<br><br>Você não vinha aqui há ${hoursSinceLastVisit} hora${hoursSinceLastVisit > 1 ? 's' : ''}! Que saudade!`;
                }
            }
        }
    }

    localStorage.setItem('lastVisit', currentTimestamp);
    document.getElementById('welcome-message').innerHTML = message;
}

// === Easter Egg: Mensagem Secreta ao Clicar no Título ===
let clickCount = 0;
let lastClickTime = 0;
document.getElementById('title').addEventListener('click', () => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 500) {
        clickCount++;
    } else {
        clickCount = 1;
    }
    lastClickTime = currentTime;

    if (clickCount >= 5) {
        alert('Ei, você encontrou um segredinho! 🥰 Sabia que eu te amo mais que chocolate quente em dia de chuva?');
        clickCount = 0;
    }
});

// === Fecha Modais ao Clicar Fora Deles ===
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    const confirmModal = document.getElementById('confirm-modal');
    const welcomeModal = document.getElementById('welcome-modal');
    const finalModal = document.getElementById('final-modal');
    if (event.target === modal) closeModal();
    if (event.target === confirmModal) cancelOpenCard();
    if (event.target === welcomeModal) closeWelcomeModal();
    if (event.target === finalModal) closeFinalModal();
};

// === Fecha Modais com a Tecla Escape ===
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeModal();
        cancelOpenCard();
        closeWelcomeModal();
        closeFinalModal();
    }
});

// === Inicialização da Página ===
window.onload = function() {
    loadCardsData();
    updateWelcomeMessage();
    document.getElementById('welcome-modal').style.display = 'block';
};