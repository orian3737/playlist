# Spotify Connect App

## Overview

The Spotify Connect App is a full-stack web application that allows users to connect to their Spotify accounts, view and manage playlists, and download tracks using OAuth2.0 for secure authorization. This application demonstrates the implementation of OAuth2.0, integration with the Spotify API, and the use of various technologies including Flask, React, and Tailwind CSS.

## Features

- OAuth2.0 Authorization: Securely connect to Spotify accounts using OAuth2.0.

- Playlist Management: View, create, and manage Spotify playlists.

- Track Download: Download tracks from playlists directly from the app.

- Responsive Design: User-friendly interface designed with Tailwind CSS and Flowbite React components.

## Installation

Prerequisites

- Python 3.8 or higher
- Node.js and npm
- PostgreSQL database

Backend Setup

Use the package manager pip to install the necessary Python packages.

```bash
cd server
pip install -r requirements.txt
flask db upgrade
flask run
```

Frontend Setup

Navigate to the client directory and install the necessary npm packages.

```bash
cd server
pip install -r requirements.txt
flask db upgrade
flask run
```

Environment Variables
Create a .env file in the root of the server directory with the necessary Spotify API credentials, database URL, and other secrets.

## Usage

Running the Backend
Start the Flask server:

```bash
flask run
Running the Frontend
Start the development server:
```

Open the app in your browser at http://127.0.0.1:5000.

Running the Frontend
Start the development server:

```bash
npm run dev
```

Open the app in your browser at http://127.0.0.1:3175.

## Tech Stack

**Backend**
(Python)
Flask
Flask-SQLAlchemy
SQLAlchemy-Serializer
Flask-Migrate
Flask-CORS
Flask-RESTful
Faker
Werkzeug
Requests
youtube-dl
BeautifulSoup4
Flask-Bcrypt
Python-Dotenv
psycopg2-binary
Gunicorn
Spotipy

**Frontend** (JavaScript)
React
React Router Dom
Redux Toolkit
Axios
Flowbite React
Tailwind CSS
Vite
ESLint
PostCSS

## OAuth2.0 Control Flow

User Authorization: The user is redirected to Spotify's authorization server where they grant permission to the app to access their Spotify data.
Authorization Code Grant: After successful authorization, the Spotify server redirects the user back to the app with an authorization code.
Access Token Exchange: The app exchanges the authorization code for an access token, which can then be used to access the user's Spotify data.
Token Management: The app manages the lifecycle of the access token, including refreshing the token when it expires.

## Screenshots

![App Screenshot](https://developer.spotify.com/images/documentation/web-api/auth-code-flow.png)

## Project Structure

Frontend

-src/components

-AppLayout.jsx: Defines the layout structure of the app.

-LoginForm.jsx: Component for user login.

-SignupForm.jsx: Component for user signup.

-DisconnectSpotify.jsx: Handles disconnecting the user's Spotify account.

-Logout.jsx: Manages user logout functionality.

-Playlists.jsx: Displays the user's Spotify playlists.

-PlaylistTracks.jsx: Shows the tracks in a selected playlist.

-SpotifyConnect.jsx: Manages the Spotify connection flow.

-UserContext.js: Provides user context across components.

-RandomBackgroundGen.js: Generates random background images for the app.

-src/routes

-Callback.jsx: Handles the Spotify OAuth2.0 callback and token exchange.

-ErrorPage.jsx: Displays error messages for unhandled routes.

-Home.jsx: The main homepage of the app.

-HowTo.jsx: Provides instructions on using the app.

-Login.jsx: Handles user login and signup.

-Tracks.jsx: Displays tracks from a selected playlist.

Backend

-app.py: The main entry point for the Flask application.

-config.py: Configuration settings for the app, including database settings.

-models.py: Defines the database models using SQLAlchemy.

-seed.py: Seeds the database with initial data.
-yt.py: Manages YouTube track downloads.

-key.py: Stores encryption keys and secrets.

-migrations/: Contains database migration scripts.

-downloads/: Directory for downloaded tracks.

## Documentation

[Spotify Wep Api Documentation](https://developer.spotify.com/documentation/web-api)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

Contributions are always welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.

## License

[MIT](https://choosealicense.com/licenses/mit/)