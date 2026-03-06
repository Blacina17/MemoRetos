import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from backend import create_app

app = create_app("development")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
