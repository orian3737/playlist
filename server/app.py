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




class CheckSession(Resource):
  def get(self):
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
        new_user = User(
        username = username,
        display_name = display_name,
        )
        new_user.password_hash = password
        try:
            
            db.session.add(new_user)
            db.session.commit()
            session['user_id'] = new_user.id
            return make_response(new_user.to_dict(), 201)
           
        except IntegrityError:
            return {'error': '422 Unprocessable Entity'}, 422

class Login(Resource):
  def post(self):
    data = request.get_json()
    username = data['username']
    password = data['password']
    user = User.query.filter(User.username == username).first()
    if user:
      if user.authenticate(password):
        session['user_id'] = user.id
        if session['user_id']:
          return make_response(user.to_dict(), 200)
        return {'error': 'session could not be established'}, 400
      return {'error': "Unauthorized"}, 401
    return {'error': "User Not Found"}, 404
  
class Logout(Resource):
    def delete(self):
        if session.get('user_id'):
            session['user_id'] = None 
            session.pop('user_id', None)
            response = make_response({"message": "Logged out successfully"}, 200)
            response.set_cookie('id', '', expires=0, path='/', httponly=True)  # Clear the 'id' cookie
            return response
        return make_response({'error': 'Unauthorized'}, 401)
  

api.add_resource(CheckSession, '/check_session', endpoint='check_session')
api.add_resource(Login, '/login', endpoint='login')
api.add_resource(Logout, '/logout', endpoint='logout')
api.add_resource(Signup, '/signup', endpoint='signup')

# @app.route('/oauth')
# def home():
#     token_info = cache_handler.get_cached_token()
#     if not sp_oauth.validate_token(token_info):
#         auth_url = sp_oauth.get_authorize_url()
#         return redirect(auth_url)
#     return redirect(url_for('get_playlists'))



#     # Automatically log them in using Spotify OAuth
#     auth_url = sp_oauth.get_authorize_url()
#     return jsonify({"auth_url": auth_url})



class Callback(Resource):
    def get(self):
        code = request.args.get('code')
        user = User.query.get(session.get('user_id'))

        if not code or not user:
            return "Authorization failed.", 400

        try:
            token_info = sp_oauth.get_access_token(code, as_dict=True)
            if not token_info:
                return "Authorization failed.", 400

            spotify_token = SpotifyToken(
                auth_token=token_info['access_token'],
                refresh_token=token_info['refresh_token'],
                expires_at=token_info['expires_at'],
                user_id=user.id
            )
            db.session.add(spotify_token)
            db.session.commit()
            return redirect(url_for('get_playlists'))  # Redirect to fetch playlists
        except Exception:
            return "Authorization failed.", 400

api.add_resource(Callback, '/callback')

@app.route('/playlists')
def get_playlists():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('home'))  # Redirect to home if user is not logged in

    user = User.query.get(user_id)
    spotify_token = SpotifyToken.query.filter_by(user_id=user_id).first()

    if not spotify_token:
        return "Spotify token not found.", 400

    # Refresh the token if it has expired
    if sp_oauth.is_token_expired({
        'access_token': spotify_token.auth_token,
        'refresh_token': spotify_token.refresh_token,
        'expires_at': spotify_token.expires_at
    }):
        try:
            token_info = sp_oauth.refresh_access_token(spotify_token.refresh_token)
            spotify_token.auth_token = token_info['access_token']
            spotify_token.refresh_token = token_info.get('refresh_token', spotify_token.refresh_token)
            spotify_token.expires_at = token_info['expires_at']
            db.session.commit()
        except Exception:
            return "Failed to refresh Spotify token.", 400

    # Use the (potentially refreshed) token to fetch playlists
    spotify = Spotify(auth=spotify_token.auth_token)

    try:
        playlists = spotify.current_user_playlists()
    except Exception:
        return "Failed to fetch playlists from Spotify.", 400

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



    db.session.commit()


# @app.after_request
# def add_csp_header(response):
#     csp = (
#         "default-src 'self'; "
#         "script-src 'self' https://apis.google.com; "
#         "connect-src 'self' http://localhost:5000; "  # Allow connections to localhost:5555
#         "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
#         "font-src 'self' https://fonts.gstatic.com;"
#     )
#     response.headers['Content-Security-Policy'] = csp
#     return response

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


if __name__ == '__main__':
    app.run(debug=True, port=5000)
