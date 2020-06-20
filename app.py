import os
import csv
import pprint

from flask import Flask, render_template, json, jsonify
from mongoengine import *
from pymongo import MongoClient
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object('config')

#Flask-CORS
CORS(app)

#database
connect('countrydb')
client = MongoClient()
db = client.countrydb


class User(Document):
    email = StringField()
    first_name = StringField()
    last_name = StringField()


class Country(Document):
    name = StringField()
    # continent = StringField()
    data = DictField()

#URL's
@app.route('/')
@app.route("/index")
@app.route('/home')
def index():
    return render_template("index.html")

@app.route("/inspiration")
def inspiration():
    return render_template("inspiration.html")

@app.route("/test")
def test():
    return render_template("index.html")


#API route
@app.route('/countries', methods=['GET'])
@app.route('/country/<country_id>', methods=['GET'])
def getCountries(country_id=None):
    users = None
    if country_id is None:
        countries = Country.objects
    else:
        countries = Country.objects.get(id=country_id)
    return countries.to_json()



@app.route("/loaddata")
def dataread():
    file_list = []

    for file in os.listdir(app.config['FILES_FOLDER']):
        filename = os.fsdecode(file)
        print(filename)
        path = os.path.join(app.config['FILES_FOLDER'], filename)
        with open(path) as csvfile:
            reader = csv.DictReader(csvfile)
            d = list(reader)
            for data in d:  # data refers to key value pair in row and d is a row
                country = Country()  # a blank placeholder country
                dict = {}  # a blank placeholder data dict
                file_list.append(data)
                for key in data:  # iterate through the header keys
                    if key == "country":
                        # check if this country already exists in the db
                        country_exists = db.country.find({"name": data.get(key)}).count() > 0

                        # if the country does not exist, we can use the new blank country we created above, and set the name
                        if not country_exists:
                            country.name = data.get(key)
                        # if the country already exists, replace the blank country with the existing country from the db,
                        # and replace the blank dict with the current country's data
                        else:
                            country = Country.objects.get(name=data.get(key))
                            dict = country.data
                    else:
                        f = filename.replace(".csv",
                                             "")  # we want to trim off the ".csv" as we can't save anything with a "." as a mongodb field name
                        if f in dict:  # check if this filename is already a field in the dict
                            dict[f][key] = data[key]  # if it is, just add a new subfield which is key : data[key] (value)
                        else:
                            dict[f] = {key: data[key]}  # if it is not, create a new object and assign it to the dict

                    country.data = dict  # add the data dict to the country

                # save the country
                country.save()

    return jsonify(file_list)


if __name__ =="__main__":
    #app.run(host='0.0.0.0', port=80)
    app.run(debug=True, port=8080)


 