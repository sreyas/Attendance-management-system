import numpy as np
import glob,os
import datetime

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
date_format = "%Y-%m-%d %H:%M:%S.%f"
current_date = str(datetime.datetime.now())
attendance_system = db.attendance.find({"user": ObjectId("5ab221040784981645037c3a")})
res = [col.encode('utf8') if isinstance(col, unicode) else col for col in attendance_system]
for attendance_doc in res:
        date_time =   attendance_doc['date_time']
        time1  = datetime.datetime.strptime(date_time.encode('utf8'), date_format)
        time2  = datetime.datetime.strptime(str(datetime.datetime.now()), date_format)
        diff = time2 - time1
	minutes = (diff.seconds) / 60       
print minutes        
if(minutes >=30):
	print ("hjhk")	
	
  
