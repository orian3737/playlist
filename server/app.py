import os
from flask import Flask, session, redirect, url_for, request, render_template
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_restful import Api
from flask_cors import CORS
from sqlalchemy import MetaData
from spotipy import Spotify
from spotipy import SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler
from supabase import create_client, Client
from models import User, Playlist, Song, PlaylistSong, Download
from dotenv import load_dotenv

load_dotenv()

# Setup Flask app
app = Flask(__name__, template_folder='server/templates/playlists.html')
app.config.from_object(Config)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SESSION_COOKIE_HTTPONLY'] = False

# Naming convention for SQLAlchemy
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
})

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
flask_bcrypt = Bcrypt(app)
api = Api(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Supabase setup
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')
supabase: Client = create_client(supabase_url, supabase_key)

# Spotify setup
client_id = os.getenv('SPOTIFY_CLIENT_ID')
client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI')
scope = 'playlist-read-private'

cache_handler = FlaskSessionCacheHandler(session)
sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope=scope,
    cache_handler=cache_handler,
    show_dialog=True
)

@app.route('/')
def home():
    token_info = cache_handler.get_cached_token()
    if not sp_oauth.validate_token(token_info):
        auth_url = sp_oauth.get_authorize_url()
        return redirect(auth_url)
    return redirect(url_for('get_playlists'))

@app.route('/callback')
def callback():
    try:
        code = request.args.get('code')
        if not code:
            return "No authorization code received.", 400

        token_info = sp_oauth.get_access_token(code)
        if not token_info:
            return "Failed to retrieve token.", 400

        session['token_info'] = token_info
        save_user(token_info)  # Save or update user details in Supabase
        return redirect(url_for('get_playlists'))
    except Exception as e:
        return f"An error occurred: {e}", 500

@app.route('/get_playlists')
def get_playlists():
    token_info = session.get('token_info')
    if not sp_oauth.validate_token(token_info):
        auth_url = sp_oauth.get_authorize_url()
        return redirect(auth_url)
    
    sp = Spotify(auth_manager=sp_oauth)
    playlists = sp.current_user_playlists()
    playlists_info = [(pl['id'], pl['name'], pl['external_urls']['spotify']) for pl in playlists['items']]
    
    playlist_tracks_info = []

    for playlist_id, playlist_name, playlist_url in playlists_info:
        tracks = sp.playlist_tracks(playlist_id)
        track_info = [(track['track']['name'], track['track']['artists'][0]['name']) for track in tracks['items']]
        playlist_tracks_info.append({
            'name': playlist_name,
            'url': playlist_url,
            'tracks': track_info
        })

    return render_template('playlists.html', playlists=playlist_tracks_info)

@app.after_request
def add_csp_header(response):
    csp = "default-src 'self'; connect-src 'self' https://*.spotify.com; script-src 'self';"
    response.headers['Content-Security-Policy'] = csp
    return response

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

def save_user(token_info):
    # Create or update user in SQLAlchemy database
    user = User.query.filter_by(username='example_username').first()
    if not user:
        user = User(
            username='example_username',
            spotify_access_token=token_info['access_token'],
            spotify_refresh_token=token_info.get('refresh_token')
        )
        db.session.add(user)
    else:
        user.spotify_access_token = token_info['access_token']
        user.spotify_refresh_token = token_info.get('refresh_token')
    
    db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
