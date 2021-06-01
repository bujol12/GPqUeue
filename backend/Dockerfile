FROM python:3.9-alpine
COPY . /backend
WORKDIR /backend

RUN apk add --no-cache gcc musl-dev linux-headers

RUN ./setup.sh

EXPOSE 5000

CMD ["./start_dev.sh"]
