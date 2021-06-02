#!/bin/sh

pipenv install
export FLASK_APP=src/app.py
export FLASK_ENV=development
pipenv run flask run --host="0.0.0.0" --port=$PORT
