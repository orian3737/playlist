from config import app, db, api
from flask import Flask, request, jsonify, session, render_template, make_response, Blueprint, send_from_directory, redirect, url_for
from flask_restful import Resource
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError  
import requests
from urllib.parse import urlencode
from models import User, Track, SpotifyToken, Download 
from functools import wraps
import os
from spotipy import Spotify
from spotipy.cache_handler import FlaskSessionCacheHandler
from spotipy.oauth2 import SpotifyOAuth
from urllib.parse import urlencode
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
import youtube_dl as ytdl_exec  # Corrected import statement

load_dotenv()

# Set the directory for YouTube downloads
app.config['YOUTUBE_DL_DIR'] = os.path.join(os.getcwd(), 'downloads')

# Setup download path
DOWNLOAD_PATH = app.config['YOUTUBE_DL_DIR']
if not os.path.exists(DOWNLOAD_PATH):
    os.makedirs(DOWNLOAD_PATH)

# Setup download path
DOWNLOAD_PATH = app.config['YOUTUBE_DL_DIR']
if not os.path.exists(DOWNLOAD_PATH):
    os.makedirs(DOWNLOAD_PATH)

@app.after_request
def add_csp_header(response):
    csp = (
        "default-src 'self' http://localhost:5173; child-src 'none'; object-src 'none'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 http://127.0.0.1:5173; "  # Allow scripts from front-end
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "  # Allow inline styles and Google Fonts
        "img-src 'self' data:; "  # Allow images from self and inline images
        "connect-src 'self' http://localhost:5173;"
        "font-src 'self' https://fonts.gstatic.com; "  # Allow Google Fonts
        "object-src 'none'; "  # Disallow object tags for security
        "base-uri 'self'; "  # Restrict base tag to prevent base URI manipulation
    )
    response.headers['Content-Security-Policy'] = csp
    return response



@app.route('/')
def shit():
    return "Welcome to the Spotify Playlist App!"

class CheckSession(Resource):
    def get(self):
        user_id =session.get('user_id')
        if user_id:
            user = User.query.filter(User.id == session.get('user_id')).first()
            if user:
                return make_response(user.to_dict(), 200)
        return {'error': 'Unauthorized'}, 401

class Signup(Resource):
    def post(self):
        username = request.get_json().get('username')
        display_name = request.get_json().get('display_name')
        password = request.get_json().get('password')
        if username and password and not User.query.filter(User.username == username).first():
            new_user = User(username=username, display_name=display_name)
            new_user.password_hash = password
            try:
                db.session.add(new_user)
                db.session.commit()
                session['user_id'] = new_user.id
                return make_response(new_user.to_dict(), 201)
            except IntegrityError:
                return {'error': '422 Unprocessable Entity'}, 422
            
def is_user_logged_in():
        return 'user_id' in session
    
class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data['username']
        password = data['password']
        user = User.query.filter(User.username == username).first()
        if user and user.authenticate(password):
            session['user_id'] = user.id
            return make_response(user.to_dict(), 200)
        return {'error': 'Unauthorized'}, 401
    
   

@app.route('/some_protected_route')
def protected_route():
    if not is_user_logged_in():
        return jsonify({"error": "Unauthorized"}), 401
    # Proceed with the route functionality if the user is logged in
    return jsonify({"message": "This is a protected route"})

     
@app.route('/check_login_status')
def check_login_status():
    if is_user_logged_in():
        return jsonify({"logged_in": True})
    else:
        return jsonify({"logged_in": False})


class Logout(Resource):
    def delete(self):
        if session.get('user_id'):
            session.pop('user_id', None)
            response = make_response({"message": "Logged out successfully"}, 200)
            response.set_cookie('id', '', expires=0, path='/', httponly=True)
            return response
        return make_response({'error': 'Unauthorized'}, 401)

api.add_resource(CheckSession, '/check_session', endpoint='check_session')
api.add_resource(Login, '/login', endpoint='login')
api.add_resource(Logout, '/logout', endpoint='logout')
api.add_resource(Signup, '/signup', endpoint='signup')


class Callback(Resource):
    def post(self):
        auth_token = request.get_json().get('access_token')
        refresh_token = request.get_json().get('refresh_token')
        expires_in = request.get_json().get('expires_in')
        
        
        user = session.get('user_id')
        if not user:
            return "User not logged in or session expired.", 400

        if not auth_token or not refresh_token or not expires_in:
            return "Missing token information.", 400


        try:
           
            
            
            # Make a request to the Spotify API to get the user info
            headers = {
                'Authorization': f'Bearer {auth_token}'
            }
            user_info_response = requests.get('https://api.spotify.com/v1/me', headers=headers)
            
            if user_info_response.status_code != 200:
                return "Failed to retrieve Spotify user info.", 400
            
            user_info = user_info_response.json()
            
      

            # Number of seconds until expiration
            expires_in_seconds = expires_in  # Example: 1 hour

            # Get the current time
            now = datetime.now(timezone.utc)

            # Calculate the expiration time by adding the seconds minus 1 second
            expires_at = now + timedelta(seconds=(expires_in_seconds - 1))

            # Print the result
            print("Current time (UTC):", now)
            print("Expiration time (UTC):", expires_at)
            print("spotify user id:", user_info['id'])
            print(type(user_info['id']))
            # # Create a new SpotifyToken entry in the database
            rb = {'auth_token': auth_token,
                  'refresh_token': refresh_token,
                  'expires_at': expires_at,
                  'user_spotify_id': user_info['id'],
                  'user_id': user,
                  }
            print(rb)

        except Exception as e:
                
            return make_response({"Failed to gather info": {e}}, 400)
                
        try:
                existing_token = SpotifyToken.query.filter(SpotifyToken.user_id ==user).first()
                if existing_token:
                    existing_token.auth_token = auth_token
                    existing_token.refresh_token = refresh_token
                    existing_token.expires_at = expires_at
                    existing_token.user_spotify_id = user_info[id]
                    existing_token.user_id = user
                    db.session.commit()

                     # Return the new access token to the frontend
                    return make_response({'access_token': existing_token['auth_token']}, 200)

                else:
                    spotify_token = SpotifyToken(
                        auth_token=auth_token,
                        refresh_token=refresh_token,
                        expires_at=expires_at,
                        user_spotify_id=user_info['id'],  # Save Spotify user ID
                        user_id=user,
                    )
                    
                    db.session.add(spotify_token)
                    db.session.commit()
                    return make_response({'access_token': auth_token}, 201)
        except Exception as e:
                db.session.rollback() 
                return make_response({"Failed to add SpotifyToken": {e}}, 400)
        

api.add_resource(Callback, '/callback')


class CheckToken(Resource):
    def patch(self):
        user_id = session.get('user_id')
        if not user_id:
            
            return make_response({'error': 'User not logged in'}, 401)
        
        
        # Check if SpotifyToken exists for the user
        spotify_token = SpotifyToken.query.filter(SpotifyToken.user_id ==user_id).first()
        
        if not spotify_token:
            return make_response({'error': 'User never connected to Spotify'}, 404)

        # Check if the token has expired
        current_time = now = datetime.now(timezone.utc)
        
        if spotify_token.expires_at > current_time:
            # Token is still valid
            return make_response({'access_token': spotify_token.auth_token}, 200)

        # Token has expired, refresh it using the sp_oauth.refresh_access_token() method
        try:
            new_token_info = sp_oauth.refresh_access_token(spotify_token.refresh_token)
            expires_in_seconds = new_token_info['expires_at'] # Example: 1 hour

            # Get the current time
            now = datetime.now(timezone.utc)

            # Calculate the expiration time by adding the seconds minus 1 second
            expires_at = now + timedelta(seconds=(expires_in_seconds - 1))

            # Update the SpotifyToken in the database with the new tokens and expiration time
            spotify_token.auth_token = new_token_info['access_token']
            spotify_token.refresh_token = new_token_info.get('refresh_token', spotify_token.refresh_token)  # If a new refresh token is provided, update it
            spotify_token.expires_at = expires_at

            db.session.commit()

            # Return the new access token to the frontend
            return make_response({'access_token': new_token_info['access_token']}, 203)

        except Exception as e:
            return make_response({'error': f'Failed to refresh token: {e}'}, 500)

api.add_resource(CheckToken, '/check_token')

class RemoveSpotifyConnection(Resource):
    def delete(self):
        user_id = session.get('user_id')
        if(user_id):
            spotify_token = SpotifyToken.query.filter(SpotifyToken.user_id ==user_id).first()
            if (spotify_token):
                db.session.delete(spotify_token)
                db.session.commit()
                return make_response({"message": "account connection deleted"}, 204)
            else:
                return make_response({'message': 'Spotify User not found: please connect to spotify'}, 404)    
        else:
            return make_response({'message':'Unauthorizied: not logged in'}, 401)

api.add_resource(RemoveSpotifyConnection, '/remove_connection')
        

# @app.route('/playlists')
# def get_playlists():
#     user_id = session.get('user_id')
#     if not user_id:
#         return redirect(url_for('home'))

#     spotify_token = SpotifyToken.query.filter_by(user_id=user_id).first()

#     if not spotify_token:
#         return "Spotify token not found.", 400

#     if sp_oauth.is_token_expired({
#         'access_token': spotify_token.auth_token,
#         'refresh_token': spotify_token.refresh_token,
#         'expires_at': spotify_token.expires_at
#     }):
#         try:
#             token_info = sp_oauth.refresh_access_token(spotify_token.refresh_token)
#             spotify_token.auth_token = token_info['access_token']
#             spotify_token.refresh_token = token_info.get('refresh_token', spotify_token.refresh_token)
#             spotify_token.expires_at = token_info['expires_at']
#             db.session.commit()
#         except Exception:
#             return "Failed to refresh Spotify token.", 400

#     spotify = Spotify(auth=spotify_token.auth_token)

#     try:
#         playlists = spotify.current_user_playlists()
#     except Exception:
#         return "Failed to fetch playlists from Spotify.", 400

#     playlists_with_tracks = []
#     for playlist in playlists['items']:
#         tracks_response = spotify.playlist_tracks(playlist['id'])
#         playlist_with_tracks = {
#             'name': playlist['name'],
#             'description': playlist.get('description', ''),
#             'owner': playlist['owner']['display_name'],
#             'tracks': [
#                 {
#                     'name': track_item['track']['name'],
#                     'album': track_item['track']['album']['name'],
#                     'artists': [artist['name'] for artist in track_item['track']['artists']],
#                     'external_url': track_item['track']['external_urls']['spotify']
#                 }
#                 for track_item in tracks_response['items']
#             ]
#         }
#         playlists_with_tracks.append(playlist_with_tracks)

#     return jsonify(playlists_with_tracks)

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

# YouTube Download Routes
# RESTful resource for track downloading

def download_youtube_audio(youtube_url, track_name):
    """
    Download audio from a YouTube URL and save it with the specified track name.

    Args:
    - youtube_url (str): The URL of the YouTube video.
    - track_name (str): The name of the track to save the audio file as.

    Returns:
    - str: The path to the downloaded audio file.
    """
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(DOWNLOAD_PATH, f'{track_name}.mp3'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
        'noplaylist': True
    }

    with ytdl_exec.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])

    return os.path.join(DOWNLOAD_PATH, f'{track_name}.mp3')

class DownloadTrack(Resource):
    def post(self):
        track_id = request.json.get('track_id')
        user_id = session.get('user_id')
        
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        
        track_info = Spotify(auth=session['spotify_token']).track(track_id)
        track_name = f"{track_info['name']} {track_info['artists'][0]['name']}"
        
        track = Track.query.filter_by(song_id=track_id).first()
        if not track:
            search_results = ytdl_exec.YoutubeDL({'dump_single_json': True}).extract_info(f"ytsearch:{track_name}", download=False)
            youtube_url = search_results['entries'][0]['webpage_url']
            output_file = download_youtube_audio(youtube_url, track_name)
            
            track = Track(song_id=track_id, name=track_name, yt_url=youtube_url)
            db.session.add(track)
            db.session.commit()
        
        download = Download(user_id=user_id, track_id=track.id, date_time=datetime.now())
        db.session.add(download)
        db.session.commit()
        
        return send_from_directory(DOWNLOAD_PATH, f"{track_name}.mp3", as_attachment=True)

# RESTful resource for playlist downloading
class DownloadPlaylist(Resource):
    def post(self):
        playlist_id = request.json.get('playlist_id')
        user_id = session.get('user_id')
        
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        
        spotify = Spotify(auth=session['spotify_token'])
        playlist_info = spotify.playlist(playlist_id)
        downloaded_files = []

        for item in playlist_info['tracks']['items']:
            track_info = item['track']
            track_name = f"{track_info['name']} {track_info['artists'][0]['name']}"
            
            track = Track.query.filter_by(song_id=track_info['id']).first()
            if not track:
                search_results = ytdl_exec.YoutubeDL({'dump_single_json': True}).extract_info(f"ytsearch:{track_name}", download=False)
                youtube_url = search_results['entries'][0]['webpage_url']
                output_file = download_youtube_audio(youtube_url, track_name)
                downloaded_files.append(output_file)
                
                track = Track(song_id=track_info['id'], name=track_name, yt_url=youtube_url)
                db.session.add(track)
                db.session.commit()
            else:
                downloaded_files.append(os.path.join(DOWNLOAD_PATH, f"{track_name}.mp3"))
            
            download = Download(user_id=user_id, track_id=track.id, date_time=datetime.now())
            db.session.add(download)
            db.session.commit()
        
        return jsonify({"downloaded_files": downloaded_files})

# Register YouTube download RESTful routes
api.add_resource(DownloadTrack, '/download/track', endpoint='download_track')
api.add_resource(DownloadPlaylist, '/download/playlist', endpoint='download_playlist')

if __name__ == '__main__':
    app.run(debug=True, port=5000)    