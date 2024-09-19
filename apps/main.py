from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/diary')
def diary():
    return render_template('diary.html')

if __name__ == '__main__':
    app.run(debug=True)