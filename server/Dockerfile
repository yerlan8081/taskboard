FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=development

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY tsconfig.json jest.config.ts ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]
