FROM node:18-alpine
 
WORKDIR /usr/src/app
 
COPY package*.json ./
 
RUN npm install
 
COPY . .

RUN sed -i 's|http://127.0.0.1:5000|http://web-server:5000|g' package.json
 
EXPOSE 3000
 
ENV CI=false
 
CMD ["npm", "start"]