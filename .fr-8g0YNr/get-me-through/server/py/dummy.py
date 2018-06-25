import numpy as np
import glob,os
from pathlib import Path
from pymongo import MongoClient
from flask_mongoengine import MongoEngine
from bson.objectid import ObjectId
client = MongoClient(port=27017)
db=client.GetMeThrough;
binary =0;
home = str(os.path.dirname(os.path.abspath(__file__))) + "/../../"
file_names = glob.glob(home + "/known_people/*.jp*g")
home = str(os.path.dirname(os.path.abspath(__file__))) + "/../../"
known_encodings_file_path = home + "/data/known_encodings_file.csv"
people_file_path = home + "/data/people_file.csv"
known_encodings_file = Path(known_encodings_file_path)
if known_encodings_file.is_file():
        known_encodings = np.genfromtxt(known_encodings_file, delimiter=',')
else:
        known_encodings = []
people_file = Path(people_file_path)
if people_file.is_file():
        people = np.genfromtxt(people_file, dtype='U',delimiter=',')
        peoplehypen = np.genfromtxt(people, dtype='U',delimiter='-')
else:
        people = []
        peoplehypen =[]
output =[];
for peopledata in peoplehypen:       
       unicodepeople =  map(str, peopledata)
       profiledata =  db.profiles.find_one({'user': ObjectId(unicodepeople[0]) })
       usercategory = db.user_categories.find_one({'_id': ObjectId(profiledata['category']) })
       output.append(usercategory['Category']);
print (output)
print (people) 
       
