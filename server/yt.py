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
from datetime import datetime
from dotenv import load_dotenv
import youtube_dl_exec as ytdl_exec
load_dotenv()

# Setup download path
DOWNLOAD_PATH = app.config['YOUTUBE_DL_DIR']
if not os.path.exists(DOWNLOAD_PATH):
    os.makedirs(DOWNLOAD_PATH)

# OAuth and User Authentication Routes
# RESTful resource for checking user session
class CheckSession(Resource):
    def get(self):
        user = User.query.filter(User.id == session.get('user_id')).first()
        if user:
            return make_response(user.to_dict(), 200)
        return {'error': 'Unauthorized'}, 401

# RESTful resource for user signup
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

# RESTful resource for user login
class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data['username']
        password = data['password']
        user = User.query.filter(User.username == username).first()
        if user:
            if user.authenticate(password):
                session['user_id'] = user.id
                return make_response(user.to_dict(), 200)
            return {'error': "Unauthorized"}, 401
        return {'error': "User Not Found"}, 404

# RESTful resource for user logout
class Logout(Resource):
    def delete(self):
        if session.get('user_id'):
            session['user_id'] = None 
            session.pop('user_id', None)
            response = make_response({"message": "Logged out successfully"}, 200)
            response.set_cookie('id', '', expires=0, path='/', httponly=True)  # Clear the 'id' cookie
            return response
        return make_response({'error': 'Unauthorized'}, 401)

# Registering RESTful routes for authentication
api.add_resource(CheckSession, '/check_session', endpoint='check_session')
api.add_resource(Login, '/login', endpoint='login')
api.add_resource(Logout, '/logout', endpoint='logout')
api.add_resource(Signup, '/signup', endpoint='signup')

# Home route to start Spotify OAuth process
@app.route('/')
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('connect_spotify'))

# Route for connecting to Spotify
@app.route('/connect_spotify')
def connect_spotify():
    token_info = cache_handler.get_cached_token()
    if not sp_oauth.validate_token(token_info):
        auth_url = sp_oauth.get_authorize_url()
        return redirect(auth_url)
    session['spotify_token'] = token_info['access_token']
    return redirect(url_for('get_playlists'))

# OAuth callback from Spotify
@app.route('/callback')
def callback():
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    if token_info:
        session['spotify_token'] = token_info
        if 'user_id' not in session:
            spotify = Spotify(auth=token_info['access_token'])
            spotify_user = spotify.current_user()
            user = User.query.filter_by(username=spotify_user['display_name']).first()
            if not user:
                user = User(username=spotify_user['display_name'], display_name=spotify_user['display_name'])
                db.session.add(user)
                db.session.commit()
            session['user_id'] = user.id
        save_user(session['spotify_token'])
        return redirect(url_for('get_playlists'))
    return "Authorization failed.", 400

# Playlist and Track Handling
# Route to display user's playlists
@app.route('/playlists')
def get_playlists():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('home'))
    
    user = User.query.get(user_id)
    spotify_token = SpotifyToken.query.filter_by(user_id=user_id).first()
    if not spotify_token:
        return "Spotify token not found.", 400
    
    spotify = Spotify(auth=spotify_token.auth_token)
    playlists = spotify.current_user_playlists()

    playlists_with_tracks = []
    for playlist in playlists['items']:
        playlist_id = playlist['id']
        tracks_response = spotify.playlist_tracks(playlist_id)
        playlist_with_tracks = {
            'name': playlist['name'],
            'description': playlist.get('description', ''),
            'owner': playlist['owner']['display_name'],
            'tracks': []
        }
        for track_item in tracks_response['items']:
            track = track_item['track']
            track_info = {
                'name': track['name'],
                'album': track['album']['name'],
                'artists': [artist['name'] for artist in track['artists']],
                'external_url': track['external_urls']['spotify']
            }
            playlist_with_tracks['tracks'].append(track_info)
        
        playlists_with_tracks.append(playlist_with_tracks)
    
    return render_template('playlists.html', playlists=playlists_with_tracks)

# Function to save Spotify token to database
def save_user(token_info):
    user = User.query.get(session['user_id'])
    spotify_token = SpotifyToken.query.filter_by(user_id=user.id).first()
    if not spotify_token:
        spotify_token = SpotifyToken(
            auth_token=token_info['access_token'],
            refresh_token=token_info.get('refresh_token'),
            user=user
        )
        db.session.add(spotify_token)
    else:
        spotify_token.auth_token = token_info['access_token']
        spotify_token.refresh_token = token_info.get('refresh_token')
    db.session.commit()

# YouTube Download Routes
# RESTful resource for track downloading
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
            search_results = ytdl_exec(track_name, {'dumpSingleJson': True})
            youtube_url = search_results['webpage_url']
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
                search_results = ytdl_exec(track_name, {'dumpSingleJson': True})
                youtube_url = search_results['webpage_url']
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

@app.after_request
def add_csp_header(response):
    csp = (
        "default-src 'self'; "
        "script-src 'self' https://www.google-analytics.com https://ssl.google-analytics.com https://www.google.com https://www.gstatic.com/recaptcha/ https://www.google.com/recaptcha/ https://*.googletagmanager.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com;"
    )
    response.headers['Content-Security-Policy'] = csp
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5000)
