from flask import Flask, jsonify, request, redirect, render_template, session, url_for, flash, make_response
from dotenv import load_dotenv
import numpy as np
import boto3
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import joblib
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import json

app = Flask(__name__)
load_dotenv()

CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:8081", "http://localhost:3000"]
    }
})

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:8081"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

DATABASE_URI = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = "DAfense101!!"
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  
app.config['SESSION_COOKIE_SECURE'] = True

db = SQLAlchemy(app)
@app.route("/")
def home():
    return "Flask is running!", 200


AWS_ACCESS_KEY = 'AKIATHVQLI26RM6QYFD4'
AWS_SECRET_KEY = '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'
BUCKET_NAME = 'userpictures-aidenfockens'
REGION_NAME = 'us-east-2'

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=REGION_NAME
)




#ClimbUser Class

class ClimbUsers(db.Model):
    __tablename__ = 'ClimbUsers'
    username = db.Column(db.String(150), primary_key=True)  
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(300), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    

@app.route('/signup', methods=['GET', 'POST'])
def signup():

    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        password = password.strip()

        # Validate input
        if not username or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400

        # Check if user exists
        if ClimbUsers.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400

        # Create new user
        new_user = ClimbUsers(username=username, email=email)

        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        session['username'] = new_user.username
        session.permanent = True

        return jsonify({'message': 'Account created successfully'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password').strip()


    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = ClimbUsers.query.filter_by(username=username).first()




    if user and user.check_password(password):
        session['username'] = user.username
        session.permanent = True
        print("logged in as user",session['username'])
        return jsonify({'message': 'Login successful!'}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401
    



@app.route('/user', methods=['GET'])
def get_user():
    print("Cookies received:", request.cookies)
    print("Session data on /user:", session)
    username = session.get('username')
    if not username:
        return jsonify({'error': 'User not logged in'}), 401

    user = db.session.get(ClimbUsers, username)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'username': user.username, 'email': user.email}), 200


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)  # Remove user ID from session
    return jsonify({'message': 'Logged out successfully'}), 200

#UserDetails

class UserDetails(db.Model):
    __tablename__ = 'UserDetails'
    username = db.Column(db.String(150), db.ForeignKey('ClimbUsers.username'), primary_key=True) 
    age = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    years_climbing = db.Column(db.Integer, nullable=False)
    rope = db.Column(db.Text, nullable=True)
    quickdraws = db.Column(db.Integer, nullable=False)
    tradGear = db.Column(db.Integer, nullable=False)
    toprope = db.Column(db.String(100), nullable=False)
    lead = db.Column(db.String(100), nullable=False)
    trad = db.Column(db.String(100), nullable=False)
    picture_url = db.Column(db.String(255), nullable=True)
    

@app.route('/userdetails/<username>', methods=['GET'])
def check_user_details(username):
    user_details = UserDetails.query.filter_by(username=username).first()
    if user_details:
        return jsonify({
            'username': user_details.username,
            'name': user_details.name,
            'age': user_details.age,
            'location': user_details.location,
            'years_climbing': user_details.years_climbing,
            'rope': user_details.rope,
            'quickdraws': user_details.quickdraws,
            'tradGear': user_details.tradGear,
            'toprope': user_details.toprope,
            'lead': user_details.lead,
            'trad': user_details.trad,
            'picture_url': user_details.picture_url,
        }), 200
    else:
        return jsonify({'error': 'User details not found'}), 404



@app.route('/userdetails', methods=['POST'])
def save_user_details():
    # Check if user is logged in
    username = session.get('username')
    print("Request headers:", request.headers)
    print("Request form data:", request.form)
    print("Request files:", request.files.get("file"))


    if not username:
        return jsonify({'error': 'User not logged in'}), 401

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    data = request.form
    name = data.get('name')
    age = data.get('age')
    location = data.get('location')
    years_climbing = data.get('years_climbing')
    rope = data.get('rope')
    quickdraws = data.get('quickdraws')
    tradGear = data.get('tradGear')
    top_roping_level = data.get('top_roping_level')
    leading_level = data.get('leading_level')
    tradClimbinglevel = data.get('tradClimbinglevel')



    if not all([name, age, location, years_climbing, quickdraws, tradGear,top_roping_level,leading_level,tradClimbinglevel]):
        return jsonify({'error': 'All required fields must be provided'}), 400

    # Upload the file to S3
    upload_result = upload_image(username, request.files.get("file"))
    if not upload_result[0]:  # Check if upload failed
        return jsonify({'error': 'Failed to upload image'}), 500

    file_url = upload_result[1]

    # Save user details and file URL to the database
    user_details = UserDetails(
        username=username,
        name=name,
        age=age,
        location=location,
        years_climbing=years_climbing,
        rope=rope,
        quickdraws=quickdraws,
        tradGear=tradGear,
        picture_url=file_url,
        toprope = top_roping_level,
        lead = leading_level,
        trad = tradClimbinglevel
    )
    db.session.add(user_details)
    db.session.commit()

    return jsonify({'message': 'User details and image saved successfully', 'url': file_url}), 201


def upload_image(username, file):
    try:
        # Secure the filename
        filename = secure_filename(file.filename)
        if not filename:
            return False, 'Invalid filename'

        # S3 key (path in bucket)
        s3_key = f"user_uploads/{username}/{filename}"

        # Upload file to S3
        s3_client.upload_fileobj(file, BUCKET_NAME, s3_key)

        # Construct the file URL
        file_url = f"https://{BUCKET_NAME}.s3.{REGION_NAME}.amazonaws.com/{s3_key}"

        return True, file_url
    except Exception as e:
        return False, str(e)



# UserEvents Class
class UserEvents(db.Model):
    __tablename__ = 'UserEvents'
    id = db.Column(db.Integer, primary_key=True)  # Unique event ID
    username = db.Column(db.String(150), db.ForeignKey('ClimbUsers.username'), nullable=False)  # Reference to ClimbUsers
    date = db.Column(db.Date, nullable=False)  # Event date
    time = db.Column(db.Time, nullable=False)  # Event time
    location = db.Column(db.String(255), nullable=False)  # Event location
    description = db.Column(db.Text, nullable=False)  # Event description
    visibility = db.Column(db.Enum('private', 'public', name='visibility_enum'), nullable=False)  # Event visibility
    allowed_users = db.Column(db.Text, nullable=True)  # JSON list of usernames for private visibility
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())  # Event creation timestamp




@app.route('/events', methods=['POST'])
def add_event():
    username = session.get('username')
    if not username:
        return jsonify({'error': 'User not logged in'}), 401

    data = request.get_json()
    date = data.get('date')
    time = data.get('time')
    location = data.get('location')
    description = data.get('description')
    visibility = data.get('visibility')
    allowed_users = data.get('allowed_users', [])  # List of usernames

    if not all([date, time, location, description, visibility]):
        return jsonify({'error': 'All fields are required'}), 400

    # Save event
    event = UserEvents(
        username=username,
        date=datetime.strptime(date, '%Y-%m-%d').date(),
        time=datetime.strptime(time, '%H:%M:%S').time(),
        location=location,
        description=description,
        visibility=visibility,
        allowed_users=json.dumps(allowed_users)
    )
    db.session.add(event)
    db.session.commit()
    return jsonify({'message': 'Event added successfully'}), 201


@app.route('/events', methods=['GET'])
def get_events():
    username = session.get('username')
    if not username:
        return jsonify({'error': 'User not logged in'}), 401

    events = UserEvents.query.filter(
        (UserEvents.username == username) |
        ((UserEvents.visibility == 'public') | (UserEvents.allowed_users.contains(username)))
    ).all()

    events_list = [{
        'id': event.id,
        'username': event.username,
        'date': event.date.strftime('%Y-%m-%d'),
        'time': event.time.strftime('%H:%M:%S'),
        'location': event.location,
        'description': event.description,
        'visibility': event.visibility,
        'allowed_users': json.loads(event.allowed_users or '[]')
    } for event in events]

    return jsonify(events_list), 200


@app.route('/search_users', methods=['GET'])
def search_users():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'error': 'Query is required'}), 400

    users = ClimbUsers.query.filter(ClimbUsers.username.ilike(f'%{query}%')).all()
    user_list = [{'username': user.username, 'email': user.email} for user in users]
    return jsonify(user_list), 200

















    
if __name__ == '__main__':
    with app.app_context():
        #db.drop_all()
        db.create_all()
    app.run(debug=True, host="0.0.0.0", port=5001)