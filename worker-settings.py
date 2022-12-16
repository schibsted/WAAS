import sys
import os
import sentry_sdk
from sentry_sdk.integrations.rq import RqIntegration

from dotenv import load_dotenv
sys.path.append('./src')
load_dotenv()

SENTRY_DSN = os.environ.get("SENTRY_DSN")

if SENTRY_DSN:
    print("Sentry detected, Using " + SENTRY_DSN)
    sentry_sdk.init(
    dsn=SENTRY_DSN,
    integrations=[
        RqIntegration()
    ],

    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    traces_sample_rate=1.0,

    # By default the SDK will try to use the SENTRY_RELEASE
    # environment variable, or infer a git commit
    # SHA as release, however you may want to set
    # something more human-readable.
    # release="myapp@1.0.0",
    )

