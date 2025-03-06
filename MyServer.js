const express = require('express');
const https = require('https');
require('dotenv').config();
const path = require('path');

const port = 3000;
const app = express();
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;


 app.use(express.static(path.join(__dirname, 'public')));

// Route pour récupérer les photos depuis Unsplash
app.get('/photos', (req, res) => {
    const options = {
        hostname: 'api.unsplash.com',
        path: '/photos?per_page=20',
        method: 'GET',
        headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
    };

    //On envoie la requête de l'API
    const request = https.request(options, (response) => {
        let data = '';

        //On recupère les données envoyer
        response.on('data', (flux) => {
            data += flux;
        });

        response.on('end', () => {
            try {
                const images = JSON.parse(data).map(photo => ({
                    id: photo.id,
                    url: photo.urls.regular,
                    description: photo.alt_description
                }));
                res.json(images);
            } catch (error) {
                res.status(500).json({ error: 'Erreur de traitement des données' });
            }
        });
    });

    request.on('error', (error) => {
        res.status(500).json({ error: 'Erreur de récupération des images' });
    });

    request.end();
});

// Route pour afficher la page HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
app.listen(port, 'localhost', () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
