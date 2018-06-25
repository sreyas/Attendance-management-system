import cv2
import sys,json,numpy as np
import glob,os
import face_recognition
import datetime
from pathlib import Path
from pymongo import MongoClient
from flask_mongoengine import MongoEngine
from bson.objectid import ObjectId
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
client = MongoClient(port=27017)
db=client.GetMeThrough;
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
        	
else:
	people = []
class VideoCamera(object):
    def __init__(self):
        # Using OpenCV to capture from device 0. If you have trouble capturing
        # from a webcam, comment the line below out and use a video file
        # instead.
        camera =  db.addconfigurations.find_one({'_id': ObjectId("5aaa4d382ca2233631b55ab4") })
        self.video = cv2.VideoCapture(camera['configuration'])
        # If you decide to use video.mp4, you must have this file in the folder
        # as the main.py.
        # self.video = cv2.VideoCapture('video.mp4')
    
    def __del__(self):
        self.video.release()
    def compare_faces(self ,detectimage):
          face_locations = face_recognition.face_locations(detectimage)
          face_encodings = face_recognition.face_encodings(detectimage, face_locations)
          match =[]
          for face_encoding in face_encodings:
                match = face_recognition.compare_faces(known_encodings, face_encoding)
          return match
    def get_name(self,peoplename):   
		collection = db['profiles']
		cursor = collection.find()
		for document in cursor:
			profileimagepath = document['imagepath'];
        		category = document['category'];
        		imagecsv =     profileimagepath.split('known_people/');
			filename = imagecsv[1].split('.');
                        imagefilename = filename[0];
                        if(peoplename == imagefilename ):
                            usercategory = db.user_categories.find_one({'_id': ObjectId(category) })
                            text =  usercategory['Category']
                            return text
                        
                        else:
 				return "Unknown"
                        
          		


    def insertattendance(self,peoplename):   
             	 collection = db['profiles']
		 cursor = collection.find()
                 
		 for document in cursor:
			profileimagepath = document['imagepath'];
        		category = document['category'];
			user = document['user'];
			imagecsv =     profileimagepath.split('known_people/');
			filename = imagecsv[1].split('.');
                        imagefilename = filename[0];
                        if(peoplename == imagefilename):
                                current_date =datetime.datetime.now()
				attendance= {"user":user,"date_time" :str(current_date)}
                                date_format = "%Y-%m-%d %H:%M:%S.%f"	
                                attendance_system = db.attendance.find({"user": user})
				res = [col.encode('utf8') if isinstance(col, unicode) else col for col in attendance_system]
				if not res:
 					 db.attendances.insert_one(attendance).inserted_id
                                else:
				  for attendance_doc in res:
					 date_time =   attendance_doc['date_time']
        				 time1  = datetime.datetime.strptime(date_time.encode('utf8'), date_format)
        			         time2  = datetime.datetime.strptime(str(datetime.datetime.now()), date_format)
        				 diff = time2 - time1
				         minutes = (diff.seconds) / 60	 
                                  if(minutes >=30):
				      db.attendances.insert_one(attendance).inserted_id

				
              
    def get_frame(self):
        success, image = self.video.read()
        # We are using Motion JPEG, but OpenCV defaults to capture raw images,
        # so we must encode it into JPEG in order to correctly display the
        # video stream.
        faces = face_cascade.detectMultiScale(image, 1.3, 5)
        for (x, y, w, h) in faces:
	    match = self.compare_faces(image);
	    name = "Unknown"
            for i in range(len(match)):    		
		if match[i]:
			face_detect_name =  self.get_name(people[i])
                	name = face_detect_name
			self.insertattendance(people[i])                   
			color = (0, 255, 0)  
 			break; 
            if "Unknown" in name:
		color = (0, 0, 255)
		name = "Unknown"
                
            if "Blacklist" in name:
		color = (0, 0, 0)
		name = "Blacklist"          
            cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
            font = cv2.FONT_HERSHEY_DUPLEX            
            cv2.putText(image, name,(x + w, y + h), font, 1.0, (255,255,255), 1)
            crop_img = image[y: y + h, x: x + w]
            cv2.imwrite(home + "/data/face.jpg", crop_img)
        ret, jpeg = cv2.imencode('.jpg', image)
        img_str = jpeg.tostring();
        return jpeg.tobytes()
