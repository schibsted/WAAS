import sys
import os
from dotenv import load_dotenv
sys.path.append('./src')
load_dotenv()
SENTRY_DSN= os.getenv('SENTRY_DSN')
from src.main import app
