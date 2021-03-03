import os
import datetime
import hashlib
from flask import Flask, session, url_for, redirect, render_template, request, abort, flash, send_from_directory, current_app
from database import list_users, verify, delete_user_from_db, add_user
from database import read_note_from_db, write_note_into_db, delete_note_from_db, match_user_id_with_note_id
from database import image_upload_record, list_images_for_user, match_user_id_with_image_uid, delete_image_from_db
from werkzeug.utils import secure_filename

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


@app.route("/")
def root():
    return render_template("index.html")

@app.route("/favicon.ico")
def favicon():
    return current_app.send_static_file('img/favicon.png')
    
@app.route("/.well-known/pki-validation/14F751662DF82FD55D06C4682458AD45.txt")
def ssl_verify():
    return send_from_directory("../14F751662DF82FD55D06C4682458AD45.txt")

@app.route("/sitemap.xml")
def sitemap():
    return render_template("sitemap.xml")

if __name__ == "__main__":
    app.run(debug=True, host="140.113.65.184", port=5000)
    #app.run(debug=True, host="127.0.0.1", port=80)
