FROM node:12
COPY . app/
WORKDIR app/
RUN npm install
EXPOSE 3000
ENTRYPOINT npm start