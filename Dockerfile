FROM node:23.8.0
COPY . /app
WORKDIR /app

RUN touch .env
ARG PUBLIC_CLERK_PUBLISHABLE_KEY
ARG PRIVATE_CLERK_SECRET_KEY
ARG CLERK_SECRET_KEY
RUN echo "PUBLIC_CLERK_PUBLISHABLE_KEY=${PUBLIC_CLERK_PUBLISHABLE_KEY}" >> .env
RUN echo "CLERK_SECRET_KEY=${CLERK_SECRET_KEY}" >> .env
RUN echo "PRIVATE_CLERK_SECRET_KEY=${PRIVATE_CLERK_SECRET_KEY}" >> .env

RUN cat .env

RUN npm install && npm run build

CMD ["node", "build"]

EXPOSE 3000
