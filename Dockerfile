FROM node:carbon as build

WORKDIR /home/app

COPY package.json /home/app/
COPY package-lock.json /home/app/

RUN npm ci

COPY . /home/app

RUN npm install -g forever sequelize-cli

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.1/wait /wait
RUN chmod +x /wait
RUN /wait

EXPOSE 80
CMD [ "npm", "start" ]
