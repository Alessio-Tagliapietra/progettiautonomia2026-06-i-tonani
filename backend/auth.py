from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User
import bcrypt
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    nick     = data.get('nick')
    email    = data.get('email')
    password = data.get('password')

    if not nick or not email or not password:
        return jsonify({'error': 'Campi mancanti'}), 400
    if User.query.get(nick) or User.query.filter_by(email=email).first():
        return jsonify({'error': 'Nick o email già in uso'}), 409

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = User(nick=nick, email=email, password=hashed)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': f'Utente {nick} registrato con successo'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    nick     = data.get('nick')
    password = data.get('password')

    user = User.query.get(nick)
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'error': 'Credenziali non valide'}), 401

    access_token = create_access_token(identity=nick)
    return jsonify(access_token=access_token)

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    logout_user()
    return jsonify({'message': 'Logout effettuato'}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    return jsonify({'nick': current_user.nick, 'email': current_user.email}), 200
