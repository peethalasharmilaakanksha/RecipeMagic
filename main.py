from flask import Flask, render_template, request # Changed from render_template_string
from boltiotai import openai
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials

# Load environment variables
load_dotenv()

# Initialize Firebase Admin using JSON file
cred = credentials.Certificate(os.path.expanduser("~/.secure_config/firebase-admin.json"))
firebase_admin.initialize_app(cred)

# OpenAI setup
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set.")

def generate_tutorial(components):
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant"},
                {"role": "user", "content":
                    # f"Suggest a recipe using: {components}, Haldi, Chilly Powder, Tomato Ketchup, Water, Garam Masala, Oil. "
                    f"""
Create a recipe with STRICT RULES:
1. Use ONLY: {components}
2. If insufficient ingredients, suggest a shopping list instead
"""
                    f"1. Creative recipe name\n2. Funny version of the name\n3. Step-by-step instructions\n4. Fun fact"
                }
            ]
        )
        return response.choices[0].message.content # Changed from response['choices'][0]['message']['content']
    except Exception as e:
        print("Error during OpenAI call:", e)
        return "Sorry! Something went wrong while generating your recipe."

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY')

@app.route('/', methods=['GET', 'POST'])
def hello():
    output = ""
    if request.method == 'POST':
        components = request.form['components']
        output = generate_tutorial(components)

    firebase_config_client = {
        "apiKey": os.getenv('FIREBASE_API_KEY'),
        "authDomain": os.getenv('FIREBASE_AUTH_DOMAIN'),
        "projectId": os.getenv('FIREBASE_PROJECT_ID'),
        "storageBucket": os.getenv('FIREBASE_STORAGE_BUCKET'),
        "messagingSenderId": os.getenv('FIREBASE_MESSAGING_SENDER_ID'),
        "appId": os.getenv('FIREBASE_APP_ID'),
        "measurementId": os.getenv('FIREBASE_MEASUREMENT_ID')
    }

    # Render the template from the templates/ directory
    return render_template('index.html', output=output)

@app.route('/generate', methods=['POST'])
def generate():
    components = request.form['components']
    return generate_tutorial(components)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8082)