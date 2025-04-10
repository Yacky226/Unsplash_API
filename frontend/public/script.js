// Sélection des éléments du DOM
const gallery = document.getElementById('gallery');
const loadButton = document.getElementById('loadButton');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const imageInfo = document.getElementById('imageInfo');
const closeModal = document.querySelector('.close');
let isLoading = false;

// Vérification des éléments du DOM
if (!gallery || !loadButton || !modal || !modalImage || !imageInfo || !closeModal) {
    console.error('Un ou plusieurs éléments du DOM sont manquants. Vérifiez votre index.html.');
}

// Fonction pour récupérer les images
async function fetchImages() {
    if (isLoading) return;

    try {
        isLoading = true;
        loadButton.disabled = true;
        gallery.innerHTML = '<div class="loading">Chargement...</div>';

        const response = await fetch('http://localhost:3001/photos');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const images = await response.json();
        gallery.innerHTML = ''; // Vider la galerie

        images.forEach(img => {
            const container = document.createElement('div');
            container.classList.add('image-container');

            const imgElement = document.createElement('img');
            //  l'URL directe de l'image 
            imgElement.src = img.url;
            imgElement.alt = img.description || 'Image sans description';
            imgElement.onerror = () => {
                imgElement.src = 'placeholder.jpg';
            };

            container.appendChild(imgElement);
            container.onclick = () => openModal(img);
            gallery.appendChild(container);
        });
    } catch (error) {
        gallery.innerHTML = '<div class="loading">Erreur de chargement</div>';
        console.error('Erreur lors de la récupération des images :', error);
    } finally {
        isLoading = false;
        loadButton.disabled = false;
    }
}

// Fonction pour ouvrir la modale
function openModal(image) {
    modalImage.src = image.url; // Utiliser l'URL directe
    modalImage.alt = image.description || 'Image sans description';
    modalImage.onerror = () => {
        modalImage.src = 'placeholder.jpg';
    };
    imageInfo.innerHTML = `
        <p><strong>Description :</strong> ${image.description || 'Non disponible'}</p>
        <p><strong>Auteur :</strong> ${image.author || 'Inconnu'}</p>
        <p><strong>Date de création :</strong> ${image.createdAt ? new Date(image.createdAt).toLocaleDateString() : 'Non spécifiée'}</p>
    `;
    modal.style.display = 'flex';
}

// Gestion de la fermeture de la modale
closeModal.onclick = () => {
    modal.style.display = 'none';
};

// Gestion du clic sur le bouton de chargement
loadButton.onclick = fetchImages;

// Charger les images au démarrage
fetchImages();

// Mettre à jour les images toutes les 30 secondes (de manière asynchrone)
async function autoUpdateImages() {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 30000)); // Attendre 30 secondes
        await fetchImages(); // Attendre que fetchImages soit terminé
    }
}
autoUpdateImages();