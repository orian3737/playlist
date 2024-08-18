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
        "script-src 'self' https://www.google-analytics.com https://ssl.google-analytics.com https://www.google.com https://www.gstatic.com/recaptcha/ https://www.google.com/recaptcha/ https://*.googletagmanager.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com;"
    )
    response.headers['Content-Security-Policy'] = csp
    return response


@app.route('/check_session', methods=['GET'])
def check_session():
    user_id = session.get('user_id')
    spotify_token = session.get('spotify_token')
    
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({
                "loggedIn": True,
                "username": user.username,
                "spotifyConnected": bool(spotify_token)
            })
    
    return jsonify({
        "loggedIn": False,
        "spotifyConnected": bool(spotify_token)
    }), 401


@app.route('/')
def home():
    token_info = cache_handler.get_cached_token()
    if not sp_oauth.validate_token(token_info):
        auth_url = sp_oauth.get_authorize_url()
        return redirect(auth_url)
    return redirect(url_for('get_playlists'))

@app.route('/check_user', methods=['POST'])
def check_user():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    
    if user:
        return jsonify({"exists": True, "username": user.username})
    return jsonify({"exists": False})

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    # Extract signup details from the request and create a new user
    username = data.get('username')
    email = data.get('email')
    full_name = data.get('full_name')
    password = data.get('password')

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    new_user = User(username=username, email=email, full_name=full_name)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    # Automatically log them in using Spotify OAuth
    auth_url = sp_oauth.get_authorize_url()
    return jsonify({"auth_url": auth_url})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        session['user_id'] = user.id
        return jsonify({"message": "Logged in successfully"})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/callback')
def callback():
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    if token_info:
        session['spotify_token'] = token_info

        if 'user_id' not in session:
            # Fetch or create the user based on Spotify info
            spotify = Spotify(auth=token_info['access_token'])
            spotify_user = spotify.current_user()
            user = User.query.filter_by(username=spotify_user['display_name']).first()
            
            if not user:
                # Create a new user if not found
                user = User(username=spotify_user['display_name'], display_name=spotify_user['display_name'])
                db.session.add(user)
                db.session.commit()

            session['user_id'] = user.id
        
        save_user(session['spotify_token'])
        return redirect(url_for('get_playlists'))  # Redirect to get_playlists endpoint
    
    return "Authorization failed.", 400

@app.route('/playlists')
def get_playlists():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('home'))  # Redirect to home if user is not logged in

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

    return jsonify(playlists_with_tracks)

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
