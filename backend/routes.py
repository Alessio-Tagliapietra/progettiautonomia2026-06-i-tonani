from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Post, Like, User
import base64
from PIL import Image
import io
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
routes_bp = Blueprint('routes', __name__, url_prefix='/api')

# --- FEED HOME: ultimi post ---
@routes_bp.route('/feed', methods=['GET'])
def feed():
    posts = Post.query.order_by(Post.dataPubblicazione.desc()).limit(50).all()
    result = []
    for p in posts:
        result.append({
            'idPost': p.idPost,
            'image': base64.b64encode(p.url).decode('utf-8'),  # BLOB → base64 per JS
            'descrizione': p.descrizione,
            'autore': p.usersNick,
            'data': p.dataPubblicazione.isoformat(),
            'likes': len(p.likes)
        })
    return jsonify(result), 200

# --- UPLOAD POST ---
@routes_bp.route('/post', methods=['POST'])
@jwt_required()
def upload_post():
    if 'image' not in request.files:
        return jsonify({'error': 'Nessuna immagine caricata'}), 400

    file = request.files['image']
    descrizione = request.form.get('descrizione', '')

    # Validazione con Pillow
    try:
        img = Image.open(file)
        img.verify()
        file.seek(0)
        image_data = file.read()
    except Exception:
        return jsonify({'error': 'File immagine non valido'}), 400

    post = Post(url=image_data, descrizione=descrizione, usersNick=current_user.nick)
    db.session.add(post)
    db.session.commit()
    return jsonify({'message': 'Post caricato!', 'idPost': post.idPost}), 201

# --- ELIMINA POST ---
@routes_bp.route('/post/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.usersNick != current_user.nick:
        return jsonify({'error': 'Non autorizzato'}), 403
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post eliminato'}), 200

# --- LIKE / UNLIKE ---
@routes_bp.route('/post/<int:post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(post_id):
    existing = Like.query.filter_by(
        Users_nick=current_user.nick,
        Post_idPost=post_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'message': 'Like rimosso'}), 200
    else:
        like = Like(Users_nick=current_user.nick, Post_idPost=post_id)
        db.session.add(like)
        db.session.commit()
        return jsonify({'message': 'Like aggiunto'}), 201

# --- PROFILO UTENTE ---
@routes_bp.route('/profile/<string:nick>', methods=['GET'])
def get_profile(nick):
    user = User.query.get_or_404(nick)
    posts = Post.query.filter_by(usersNick=nick).order_by(Post.dataPubblicazione.desc()).all()
    return jsonify({
        'nick': user.nick,
        'posts': [{
            'idPost': p.idPost,
            'image': base64.b64encode(p.url).decode('utf-8'),
            'descrizione': p.descrizione,
            'data': p.dataPubblicazione.isoformat(),
            'likes': len(p.likes)
        } for p in posts]
    }), 200
