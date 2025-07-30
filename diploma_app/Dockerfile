FROM python:3.13

EXPOSE 5000

WORKDIR /diploma_app

COPY ./requirements.txt requirements.txt

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .

CMD ["flask", "--app", "app.py", "run", "--host=0.0.0.0"]