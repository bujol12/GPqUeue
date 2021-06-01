FROM python:3.9-alpine
COPY backend/ /backend
WORKDIR /backend

RUN apk add --no-cache gcc musl-dev linux-headers

RUN chmod +x setup.sh
RUN ./setup.sh

RUN pipenv install
EXPOSE 5000

#CMD ["/backend/start_dev.sh"]