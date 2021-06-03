#!/bin/sh

export FLASK_APP=src/app.py
export FLASK_ENV=development
pipenv run flask run --host="backend" --port=$PORT
