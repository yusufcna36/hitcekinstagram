import os
import uuid
import pyqrcode
import io
from flask import Flask, render_template, request, redirect, url_for, session, send_file, make_response, send_from_directory
from flask_session import Session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.utils import secure_filename
from supabase import create_client, Client
from dotenv import load_dotenv
import bcrypt
import sqlite3
from io import BytesIO

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SESSION_TYPE'] = 'filesystem'

app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=True
)

Session(app)

limiter = Limiter(get_remote_address, app=app, default_limits=["200 per day", "50 per hour"])

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')
supabase: Client = create_client(supabase_url, supabase_key)

def get_db():
    conn = sqlite3.connect('site.db')
    conn.row_factory = sqlite3.Row
    return conn

# Init DB tables (added settings for wallet)
with get_db() as db:
    db.execute('''CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, credits INTEGER DEFAULT 0)''')
    db.execute('''CREATE TABLE IF NOT EXISTS queue (id INTEGER PRIMARY KEY AUTOINCREMENT, file_path TEXT)''')
    db.execute('''CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, user_id TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    db.execute('''CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)''')
    # Default wallet if not set
    if not db.execute('SELECT * FROM settings WHERE key = "wallet_address"').fetchone():
        db.execute('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', ('wallet_address', os.getenv('WALLET_ADDRESS', '')))
        db.commit()

admin_pass = os.getenv('ADMIN_PASSWORD').encode('utf-8')
hashed_admin_pass = bcrypt.hashpw(admin_pass, bcrypt.gensalt())

@app.route('/')
def index():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
    user_id = session['user_id']
    with get_db() as db:
        user = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        if not user:
            db.execute('INSERT INTO users (id, credits) VALUES (?, 0)', (user_id,))
            db.commit()
            credits = 0
        else:
            credits = user['credits']
    return render_template('index.html', credits=credits)

@app.route('/add_credit', methods=['POST'])
@limiter.limit("10 per minute")
def add_credit():
    if 'user_id' not in session:
        return 'Unauthorized', 401
    user_id = session['user_id']
    with get_db() as db:
        db.execute('UPDATE users SET credits = credits + 1 WHERE id = ?', (user_id,))
        db.commit()
        db.execute('INSERT INTO logs (action, user_id) VALUES (?, ?)', ('credit_added', user_id))
    return 'Credit added'

@app.route('/claim_reward', methods=['POST'])
@limiter.limit("1 per minute")
def claim_reward():
    if 'user_id' not in session:
        return 'Unauthorized', 401
    user_id = session['user_id']
    with get_db() as db:
        user = db.execute('SELECT credits FROM users WHERE id = ?', (user_id,)).fetchone()
        if user['credits'] < 100:
            return 'Insufficient credits', 400
        queue_item = db.execute('SELECT * FROM queue ORDER BY id ASC LIMIT 1').fetchone()
        if not queue_item:
            return 'No rewards available', 404
        file_path = queue_item['file_path']
        response = supabase.storage.from_('accounts').download(file_path)
        if not response:
            return 'File not found', 404
        file_data = BytesIO(response)
        db.execute('UPDATE users SET credits = credits - 100 WHERE id = ?', (user_id,))
        db.execute('DELETE FROM queue WHERE id = ?', (queue_item['id'],))
        db.execute('INSERT INTO logs (action, user_id) VALUES (?, ?)', ('reward_claimed', user_id))
        db.commit()
        resp = make_response(send_file(file_data, as_attachment=True, download_name=secure_filename(file_path)))
        return resp

@app.route('/payment', methods=['GET', 'POST'])
def payment():
    with get_db() as db:
        wallet = db.execute('SELECT value FROM settings WHERE key = "wallet_address"').fetchone()['value']
    if not wallet:
        return 'Wallet not set', 400
    qr = pyqrcode.create(wallet)
    qr_buffer = io.BytesIO()
    qr.png(qr_buffer, scale=6)
    qr_buffer.seek(0)
    if request.method == 'POST':
        tx_id = request.form.get('tx_id')
        # Manuel doğrulama: Log'a ekle, admin görsün
        with get_db() as db:
            db.execute('INSERT INTO logs (action, user_id) VALUES (?, ?)', (f'Payment TX: {tx_id}', session.get('user_id', 'anon')))
            db.commit()
        return 'TX submitted, admin will verify and add credits soon!'
    return render_template('payment.html', wallet=wallet, qr_url=url_for('qr_code'))

@app.route('/qr_code')
def qr_code():
    with get_db() as db:
        wallet = db.execute('SELECT value FROM settings WHERE key = "wallet_address"').fetchone()['value']
    qr = pyqrcode.create(wallet)
    qr_buffer = io.BytesIO()
    qr.png(qr_buffer, scale=6)
    qr_buffer.seek(0)
    return send_file(qr_buffer, mimetype='image/png')

@app.route('/yusufcna36', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def admin():
    if request.method == 'POST' and not session.get('admin'):
        password = request.form.get('password', '').encode('utf-8')
        if bcrypt.checkpw(password, hashed_admin_pass):
            session['admin'] = True
            return redirect(url_for('admin'))
        else:
            return 'Wrong password', 403
    if not session.get('admin'):
        return render_template('admin_login.html')
    # Handle wallet update
    if request.method == 'POST' and 'wallet' in request.form:
        new_wallet = request.form['wallet']
        with get_db() as db:
            db.execute('UPDATE settings SET value = ? WHERE key = "wallet_address"', (new_wallet,))
            db.commit()
    # Handle file upload
    if 'file' in request.files:
        file = request.files['file']
        if file:
            filename = secure_filename(file.filename)
            file_data = file.read()
            upload_path = f'accounts/{uuid.uuid4()}_{filename}'
            supabase.storage.from_('accounts').upload(upload_path, file_data)
            with get_db() as db:
                db.execute('INSERT INTO queue (file_path) VALUES (?)', (upload_path,))
                db.commit()
                db.execute('INSERT INTO logs (action, user_id) VALUES (?, ?)', ('file_uploaded', 'admin'))
    with get_db() as db:
        queue = db.execute('SELECT * FROM queue').fetchall()
        logs = db.execute('SELECT * FROM logs ORDER BY id DESC LIMIT 50').fetchall()
        wallet = db.execute('SELECT value FROM settings WHERE key = "wallet_address"').fetchone()['value']
    return render_template('admin.html', queue=queue, logs=logs, wallet=wallet)

@app.route('/logout_admin')
def logout_admin():
    session.pop('admin', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)