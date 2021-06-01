#! /bin/sh

pipenv install
export FLASK_APP=src/app.py
export FLASK_ENV=development
pipenv run flask run
