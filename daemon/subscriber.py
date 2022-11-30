import redis

red = redis.StrictRedis('redis', 6379, charset="utf-8", decode_responses=True)

def user_counter():
    sub = red.pubsub()
    sub.subscribe('usernames')
    for message in sub.listen():
        if message is not None and isinstance(message, dict):
            username = message.get('data')
            red.zincrby('username_scoreboard', 1, username)
while True:
  print("Foobar")
  user_counter()