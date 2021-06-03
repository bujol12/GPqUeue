#!/bin/sh
cd src || exit
pipenv run python -m pytest
