FROM python:3.10-buster

WORKDIR /workspace
RUN apt-get install -y git
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY src src

CMD [ "python3", "-m" , "frontend/main", "run", "--host=0.0.0.0"]
