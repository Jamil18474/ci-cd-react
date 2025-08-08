FROM node:20-alpine

# ✅ CORRIGER: Cohérence avec le PATH
WORKDIR /app

# ✅ CORRIGER: PATH cohérent avec WORKDIR
ENV PATH /app/node_modules/.bin:$PATH

# Install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

# ✅ AJOUTER: Copier le code source
COPY . .

# Exposer le port
EXPOSE 8000

# ✅ AJOUTER: Commande pour démarrer l'app
CMD ["npm", "start"]
