from app import app
from models import User, Playlist, Song, Download, PlaylistSong
from config import db
from faker import Faker
from random import choice as rc

fake = Faker()

def seed_db():
    with app.app_context():
        # Drop all existing tables
        db.drop_all()
        
        # Create all tables
        db.create_all()

        # Create users
        users = [User(username=fake.user_name()) for _ in range(10)]
        for user in users:
            user.password_hash = 'Seeded123'
        db.session.bulk_save_objects(users)
        db.session.commit()

        # Fetch users from the database to get assigned IDs
        users = User.query.all()

        # Create playlists with valid users
        playlists = []
        for user in users:
            for _ in range(3):
                playlist = Playlist(name=fake.word(), user_id=user.id)
                playlists.append(playlist)
        db.session.bulk_save_objects(playlists)
        db.session.commit()

        # Fetch playlists from the database to get assigned IDs
        playlists = Playlist.query.all()
        
        # Create songs associated with playlists
        songs = [Song(title=fake.word(), artist=fake.word()) for _ in range(150)]
        db.session.bulk_save_objects(songs)
        db.session.commit()

        # Fetch songs from the database to get assigned IDs
        songs = Song.query.all()

        # Create PlaylistSong associations
        playlist_songs = []
        for playlist in playlists:
            for _ in range(4):
                rand_song = rc(songs)
                playlist_song = PlaylistSong(playlist_id=playlist.id, song_id=rand_song.id)
                playlist_songs.append(playlist_song)
        db.session.bulk_save_objects(playlist_songs)
        db.session.commit()

        # Create downloads associated with songs
        downloads = [Download(song_id=song.id, url=fake.url(), status='completed') for song in songs]
        db.session.bulk_save_objects(downloads)
        db.session.commit()

        print("Database seeded!")

if __name__ == '__main__':
    seed_db()
