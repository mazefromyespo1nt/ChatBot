# Usa una imagen de Node.js para producción
FROM node:16

# Author
LABEL maintainer="Enrique <ebgvdeveloper@gmail.com>"

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /crm

# Copia package.json y package-lock.json al contenedor
COPY package*.json ./

# Instala las dependencias
RUN npm install --force

# Copia el resto del código de la aplicación al contenedor
COPY . .

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 8022

# Ejecuta la aplicación
CMD ["npm", "run", "start"]
