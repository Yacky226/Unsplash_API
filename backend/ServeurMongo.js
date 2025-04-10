const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const imageModel = require('./model/imageModel');
const axios = require('axios');
const cleanData = require('./service/cleandata');

const port = 3001;
const app = express();
const UNSPLASH_ACCESS_KEY ='Qt1RvecdHBVIPkgzyrLm-O0fvkzWPw7N8luvnOz48-Q';

app.use(cors());
app.use(express.json());

// Connexion à MongoDB 
mongoose
    .connect('mongodb://mongodb:27017/unsplash', {})
    .then(() => console.log('Connexion à la base de données réussie'))
    .catch((error) => console.error('Erreur de connexion à MongoDB:', error));

// Route pour récupérer les photos depuis la base de données
app.get('/photos', async (req, res) => {
    try {
        const images = await imageModel.find();
        if (images.length === 0) {
            return res.status(404).json({ message: 'Aucune image trouvée dans la base de données' });
        }
        res.json(images);
    } catch (error) {
        console.error('Erreur lors de la récupération des photos depuis MongoDB:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des photos' });
    }
});

// Route pour mettre à jour les images en base de données
app.get('/photos/update', async (req, res) => {
    try {
        const response = await axios.get('https://api.unsplash.com/photos?per_page=20&order_by=latest', {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
        });
        const imagesFromAPI = cleanData(response.data);

        const storedImageIds = new Set(await imageModel.distinct('id'));
        let newImages = imagesFromAPI.filter(img => !storedImageIds.has(img.id));

        if (newImages.length > 0) {
            await imageModel.insertMany(newImages);
            res.json({ message: `${newImages.length} nouvelles images ajoutées` });
        } else {
            res.json({ message: 'Aucune nouvelle image à ajouter' });
        }
    } catch (error) {
        console.error("Erreur lors de l'update des images:", error);
        res.status(500).json({ error: "Erreur lors de l'update des images" });
    }
});

// Route pour proxyfier les images
app.get('/proxy-image', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).json({ error: 'URL de l\'image manquante' });
    }

    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
        });

        res.set('Content-Type', response.headers['content-type']);
        res.set('Content-Length', response.headers['content-length']);
        res.send(response.data);
    } catch (error) {
        console.error('Erreur lors du proxyfication de l\'image:', error);
        res.status(500).json({ error: 'Erreur lors du chargement de l\'image' });
    }
});

// Fonction pour mettre à jour les images automatiquement
async function updateImages() {
    try {
        const response = await axios.get('https://api.unsplash.com/photos?per_page=20&order_by=latest', {
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
        });
        const imagesFromAPI = cleanData(response.data);

        const storedImageIds = new Set(await imageModel.distinct('id'));
        let newImages = imagesFromAPI.filter(img => !storedImageIds.has(img.id));

        if (newImages.length > 0) {
            await imageModel.insertMany(newImages);
            console.log(`${newImages.length} nouvelles images ajoutées`);
        } else {
            console.log('Aucune nouvelle image à ajouter');
        }
    } catch (error) {
        console.error("Erreur lors de l'update automatique des images:", error);
    }
}

// Mettre à jour les images au démarrage et toutes les 1H
updateImages();
setInterval(updateImages, 5000000);

// Démarrer le serveur
app.listen(port, () => {
    console.log(` Serveur en ligne : http://localhost:${port}`);
});