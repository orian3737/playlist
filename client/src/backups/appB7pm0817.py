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
load_dotenv()




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



@app.after_request
def add_csp_header(response):
    csp = (
        "default-src 'self'; "
        "connect-src 'self' https://*.spotify.com https://brqztkabsqpvevgcmrgr.supabase.co https://infragrid.v.network; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://ssl.google-analytics.com https://www.google.com https://www.gstatic.com/recaptcha/ https://www.google.com/recaptcha/ https://*.googletagmanager.com 'sha256-YqD0Y6nJN+K0Y08J+Ena6eHgZrJ7WcWbIsC/u7GiyVk=' https://accounts.scdn.co; "  # Allow inline scripts (be cautious with this setting)
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com;"
    )
    response.headers['Content-Security-Policy'] = csp
    return response

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

        # Check if the code is valid and retrieve token info
        token_info = sp_oauth.get_access_token(code)
        if not token_info:
            return "Failed to retrieve token.", 400

        # Save token info in session
        session['token_info'] = token_info if isinstance(token_info, dict) else {'access_token': token_info}
        save_user(session['token_info'])  # Save or update user details in Supabase

        return redirect(url_for('get_playlists'))
    except Exception as e:
        print(f"An error occurred: {e}")
        return f"An error occurred: {e}", 500

@app.route('/get_playlists')  #adding in the id parsing
def get_playlists():
    token_info = session.get('token_info')
    if not sp_oauth.validate_token(token_info):
        auth_url = sp_oauth.get_authorize_url()
        return redirect(auth_url)

    sp = Spotify(auth_manager=sp_oauth)
    playlists = sp.current_user_playlists()
    playlists_info = [{
        'id': pl['id'],
        'name': pl['name'],
        'url': pl['external_urls']['spotify']
    } for pl in playlists['items']]
    
    playlist_tracks_info = []

    for playlist in playlists_info:
        playlist_id = playlist['id']
        tracks = sp.playlist_tracks(playlist_id)
        track_info = [{
            'name': track['track']['name'],
            'artist': track['track']['artists'][0]['name']
        } for track in tracks['items']]
        playlist_tracks_info.append({
            'name': playlist['name'],
            'url': playlist['url'],
            'tracks': track_info
        })

    return jsonify(playlist_tracks_info)

@app.route('/logout')
def logout():
    session.clear()
    return 

@app.route('/login')
def login():
    # Redirect to Spotify authentication page
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

def save_user(token_info):
    # Create or update user in SQLAlchemy database
    user = User.query.filter_by(username='example_username').first()
    if not user:
        user = User(
            username='example_username',
            display_name='Example Display Name'
        )
        db.session.add(user)
    
    # Create or update SpotifyToken
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
