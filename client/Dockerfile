FROM node:20-alpine AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.next ./.next
COPY --from=deps /app/public ./public
COPY --from=deps /app/app ./app
COPY --from=deps /app/next.config.mjs ./next.config.mjs
COPY --from=deps /app/tailwind.config.js ./tailwind.config.js
COPY --from=deps /app/postcss.config.js ./postcss.config.js
COPY --from=deps /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["npm", "run", "start"]
