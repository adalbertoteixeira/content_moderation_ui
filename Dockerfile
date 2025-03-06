FROM node:23.8.0
COPY . /app
WORKDIR /app
RUN npm install && npm run build

CMD ["node", "build"]

EXPOSE 3000
