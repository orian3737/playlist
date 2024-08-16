from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy_serializer import SerializerMixin
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
flask_bcrypt = Bcrypt()

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    _password_hash = db.Column(db.String(128))
    display_name = db.Column(db.String(120))
    playlists = db.relationship('Playlist', back_populates='user')
    spotify_access_token = db.Column(db.String(512))
    spotify_refresh_token = db.Column(db.String(512))

    serialize_rules = (
        '-_password_hash',
        '-playlists.user',
        '-spotify_access_token',
        '-spotify_refresh_token'
    )

    @hybrid_property
    def password_hash(self):
        raise Exception('Password hashes may not be viewed')

    @password_hash.setter
    def password_hash(self, password):
        password_hash = flask_bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return flask_bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

class Playlist(db.Model, SerializerMixin):
    __tablename__ = 'playlists'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    user = db.relationship('User', back_populates='playlists')
    songs = db.relationship('PlaylistSong', back_populates='playlist')

    serialize_rules = (
        '-user.playlists',
        '-songs.playlist'
    )

class Song(db.Model, SerializerMixin):
    __tablename__ = 'songs'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(120), nullable=False)
    artist = db.Column(db.String(120), nullable=False)

    playlist_songs = db.relationship('PlaylistSong', back_populates='song')

    serialize_rules = (
        '-playlist_songs.playlist',
    )

class PlaylistSong(db.Model, SerializerMixin):
    __tablename__ = 'playlist_songs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    playlist_id = db.Column(db.Integer, db.ForeignKey('playlists.id', ondelete='CASCADE'), nullable=False)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id', ondelete='CASCADE'), nullable=False)

    playlist = db.relationship('Playlist', back_populates='songs')
    song = db.relationship('Song', back_populates='playlist_songs')

    serialize_rules = (
        '-playlist.songs',
        '-song.playlist_songs'
    )

class Download(db.Model, SerializerMixin):
    __tablename__ = 'downloads'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'))
    url = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), nullable=False)

    serialize_rules = (
        '-song.playlist_songs',
    )
