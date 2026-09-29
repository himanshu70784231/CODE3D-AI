# Dockerfile for CODE3D-AI Node.js Backend & Execution Sandbox
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Generate Prisma Client
RUN npx prisma generate

ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/index.js"]
