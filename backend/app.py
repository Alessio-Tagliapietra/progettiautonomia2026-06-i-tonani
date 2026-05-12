from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os
from models import db, User, TokenBlocklist
load_dotenv()

app = Flask(
    __name__,
    template_folder='../frontend',
    static_folder='../frontend',
    static_url_path=''
)
app.config['SECRET_KEY']                  = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI']     = 'sqlite:///portfolio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH']          = 16 * 1024 * 1024  # 16MB
app.config['JWT_SECRET_KEY']              = os.getenv('JWT_SECRET_KEY', '0607')

# ─── CORS: permette al frontend (aperto come file o su altro porta) di chiamare il backend ───
CORS(app, resources={r"/*": {"origins": "*"}},
     supports_credentials=False)   # False perché non usiamo cookie ma Bearer token

jwt = JWTManager(app)
db.init_app(app)

login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti   = jwt_payload['jti']
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
    return token is not None

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

from routes import routes_bp
from auth    import auth_bp
app.register_blueprint(routes_bp, url_prefix='/api')
app.register_blueprint(auth_bp,   url_prefix='/auth')

@app.route('/')
def home():
    from flask import render_template
    return render_template('index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
