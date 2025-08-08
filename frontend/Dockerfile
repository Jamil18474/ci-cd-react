# Pull image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
RUN npm install react-scripts@5.0.1 -g --silent

# ✅ AJOUTER: Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# ✅ AJOUTER: Commande pour démarrer l'app
CMD ["npm", "start"]