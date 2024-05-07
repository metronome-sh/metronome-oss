FROM --platform=linux/amd64 node:20-bullseye-slim as base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl git curl

# Install pnpm
RUN npm install -g pnpm

WORKDIR /home/node/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Packages
COPY packages ./packages/

# Web
COPY apps/web ./apps/web

# Workers
COPY apps/workers ./apps/workers

RUN pnpm i

RUN pnpm build

# Remove node_modules from everywhere
RUN find . '(' -name \"node_modules\" ')' -type d -prune -exec rm -rf '{}' +

# Reinstall only production dependencies
RUN pnpm i --prod

CMD ["pnpm", "--filter", "@metronome/web", "start"]
