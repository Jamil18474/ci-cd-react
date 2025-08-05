# MongoDB container with initialization scripts
FROM mongo:8.0.12

LABEL maintainer="Jamil18474"
LABEL description="MongoDB for User Management API"
LABEL version="1.0"

# Copy initialization scripts
COPY init-scripts/ /docker-entrypoint-initdb.d/

EXPOSE 27017

CMD ["mongod"]