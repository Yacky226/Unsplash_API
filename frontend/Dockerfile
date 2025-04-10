#  une version spécifique de l'image Nginx basée sur Alpine pour plus de stabilité
FROM nginx:1.27.4-alpine

# le répertoire de travail
WORKDIR /usr/share/nginx/html

# Copier les fichiers statiques du répertoire public
COPY public/ /usr/share/nginx/html/

# les permissions pour s'assurer que Nginx peut lire les fichiers
RUN chmod -R 755 /usr/share/nginx/html

# Exposer le port 80 
EXPOSE 80

# Commande par défaut pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]