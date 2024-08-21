from config import db, flask_bcrypt
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import DateTime
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    _password_hash = db.Column(db.String(128))
    display_name = db.Column(db.String(120))
    downloads = db.relationship('Download', back_populates='user', cascade="all, delete-orphan")
    spotify_token = db.relationship('SpotifyToken', uselist=False, back_populates='user', cascade="all, delete-orphan")

    serialize_rules = (
        '-_password_hash',  # Exclude the password hash from serialization
        '-downloads.user',  # Prevent recursion
        '-spotify_token',  # Prevent recursion
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


class SpotifyToken(db.Model, SerializerMixin):
    __tablename__ = 'tokens'
        
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    auth_token = db.Column(db.String(512), nullable=False)
    refresh_token = db.Column(db.String(512), nullable=False)
    user_spotify_id = db.Column(db.String, nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)  # Store the expiration time
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', back_populates='spotify_token')

 

class Track(db.Model, SerializerMixin):
    __tablename__ = 'tracks'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    song_id = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    yt_url = db.Column(db.String(255))

    downloads = db.relationship('Download', back_populates='track', cascade="all, delete-orphan")

    serialize_rules = (
        '-downloads.track',  # Prevent recursion
    )


class Download(db.Model, SerializerMixin):
    __tablename__ = 'downloads'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    track_id = db.Column(db.Integer, db.ForeignKey('tracks.id'), nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', back_populates='downloads')
    track = db.relationship('Track', back_populates='downloads')

    serialize_rules = (
        '-user.downloads',  # Prevent recursion
        '-track.downloads',  # Prevent recursion
    )
