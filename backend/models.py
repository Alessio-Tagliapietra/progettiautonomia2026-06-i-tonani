from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime, timezone

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'Users'
    nick       = db.Column(db.String(20), primary_key=True)
    password   = db.Column(db.String(256), nullable=False)
    email      = db.Column(db.String(45), unique=True, nullable=False)

    posts = db.relationship('Post', backref='author', lazy=True)
    likes = db.relationship('Like', backref='user', lazy=True)

    def get_id(self):
        return self.nick  # Flask-Login usa nick come ID

class Post(db.Model):
    __tablename__ = 'Post'
    idPost            = db.Column(db.Integer, primary_key=True, autoincrement=True)
    url               = db.Column(db.LargeBinary, nullable=False)   # BLOB immagine
    descrizione       = db.Column(db.String(256), nullable=True)
    usersNick         = db.Column(db.String(20), db.ForeignKey('Users.nick'), nullable=False)
    dataPubblicazione = db.Column(db.DateTime, default=datetime.utcnow)

    likes = db.relationship('Like', backref='post', lazy=True)

class Like(db.Model):
    __tablename__ = 'Likes'
    Users_nick   = db.Column(db.String(20), db.ForeignKey('Users.nick'), primary_key=True)
    Post_idPost  = db.Column(db.Integer, db.ForeignKey('Post.idPost'), primary_key=True)

class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True, unique=True)
    token_type = db.Column(db.String(16), nullable=False)
    user_nick = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))