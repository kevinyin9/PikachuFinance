from flask import Flask, render_template, send_from_directory, current_app
from flask_sslify import SSLify
import random

app = Flask(__name__)
app.config.from_object('config')

@app.errorhandler(401)
def FUN_401(error):
    return render_template("page_401.html"), 401

@app.errorhandler(403)
def FUN_403(error):
    return render_template("page_403.html"), 403

@app.errorhandler(404)
def FUN_404(error):
    return render_template("page_404.html"), 404

@app.errorhandler(405)
def FUN_405(error):
    return render_template("page_405.html"), 405

@app.errorhandler(413)
def FUN_413(error):
    return render_template("page_413.html"), 413

@app.route("/", subdomain="app")
def game_page():
    return render_template("game.html")

@app.route("/")
def root():
    return render_template("homepage.html")

money = 164365
@app.route("/tvl")
def tvl():
    global money
    money += random.random()
    return str(round(money, 1))

@app.route("/favicon.ico")
def favicon():
    return current_app.send_static_file('img/favicon.png')
    
@app.route("/.well-known/pki-validation/14F751662DF82FD55D06C4682458AD45.txt")
def ssl_verify():
    return send_from_directory(directory="./ssl", path="14F751662DF82FD55D06C4682458AD45.txt")

@app.route("/.well-known/pki-validation/C9925BFCCBC6FC5ED209C94EF1F3C1DF.txt")
def ssl_verify2():
    return send_from_directory(directory="./ssl", path='C9925BFCCBC6FC5ED209C94EF1F3C1DF.txt')

@app.route("/sitemap.xml")
def sitemap():
    return render_template("sitemap.xml")

if __name__ == "__main__":
    sslify = SSLify(app)
    context = ('./ssl/certificate.crt', './ssl/private.key')
    #app.run(debug=True, host="140.113.65.184", port=80)
    app.run(debug=True, host="0.0.0.0", port=443, ssl_context=context)
