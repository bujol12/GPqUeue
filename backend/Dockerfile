FROM python:3.9-alpine
WORKDIR /backend
RUN apk add --no-cache gcc musl-dev linux-headers
COPY . .
RUN ./setup.sh
RUN chmod +x test.sh
EXPOSE $PORT
CMD ["./start_dev.sh"]
