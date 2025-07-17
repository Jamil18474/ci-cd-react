FROM mongo:latest

COPY init-scripts/ /docker-entrypoint-initdb.d/

EXPOSE 27017

CMD ["mongod"]
