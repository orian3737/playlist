import os
from dotenv import load_dotenv
load_dotenv()
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_cors import CORS


app = Flask(
  __name__, 
  static_folder='../client/src/static',
  template_folder='../client/src'
)


app.secret_key = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SUPABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_NAME'] = 'id'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
# Spotify OAuth configuration
app.config['SPOTIFY_CLIENT_ID'] = os.getenv('SPOTIFY_CLIENT_ID')
app.config['SPOTIFY_CLIENT_SECRET'] = os.getenv('SPOTIFY_CLIENT_SECRET')
app.config['SPOTIFY_ACCESS_TOKEN'] = os.getenv('SPOTIFY_ACCESS_TOKEN')
app.config['SPOTIFY_REDIRECT_URI'] = 'http://127.0.0.1:5173/Home'
app.json.compact = False

metadata = MetaData(naming_convention={
"fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app)
flask_bcrypt = Bcrypt(app)
api = Api(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})
