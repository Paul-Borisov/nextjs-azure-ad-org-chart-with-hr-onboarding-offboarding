# https://medium.com/@itsuki.enjoylife/dockerize-a-next-js-app-4b03021e084d
# docker build -t nextjs-org-chart .
# docker run -p 3000:3000 nextjs-org-chart
FROM node:20-alpine
ENV NODE_ENV=development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD npm run dev