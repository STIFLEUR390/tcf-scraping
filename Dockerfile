# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copie de tous les fichiers nécessaires
COPY . .

# Installation des dépendances
RUN npm install --omit=dev

# Étape de production
FROM node:18-alpine

WORKDIR /app

# Copie des dépendances et du code depuis l'étape de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Création d'un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Exposition du port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production

# Commande de démarrage
CMD ["npm", "start"]