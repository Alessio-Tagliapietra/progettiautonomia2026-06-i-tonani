from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from dotenv import load_dotenv
import os
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_jwt_extended import get_jwt
from models import db, User, TokenBlocklist
load_dotenv()

app = Flask(
    __name__,
    template_folder='../frontend',
    static_folder='../frontend',
    static_url_path=''
)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
app.config["JWT_SECRET_KEY"] = "0607"  # Change this!

jwt = JWTManager(app)

from models import db, User
db.init_app(app)

login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
    return token is not None

@login_manager.user_loader
def load_user(user_id):

    return User.query.get(user_id)

from routes import routes_bp
from auth import auth_bp
app.register_blueprint(routes_bp, url_prefix= "/api")
app.register_blueprint(auth_bp, url_prefix= "/auth")

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

