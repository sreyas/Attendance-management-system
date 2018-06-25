import face_recognition
import cv2
import urllib 
import sys,json,numpy as np
import glob,os
from pathlib import Path
import numpy as np
home = str(os.path.dirname(os.path.abspath(__file__))) + "/../../"
file_names = glob.glob(home + "/known_people/*.jp*g")
def read_in():
    lines = sys.stdin.readline()
    return lines
def authorised(name):
   return not "Unknown" in name
def main():
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
   stream=urllib.urlopen('rtsp://sreyas:123asd@192.168.0.210:554/videoMain')
   bytes=''
   face_locations = []
   face_encodings = []
   face_names = []
   process_this_frame = True
   while True:
    bytes+=stream.read(1024)
    a = bytes.find('\xff\xd8')
    b = bytes.find('\xff\xd9')
    if a!=-1 and b!=-1:
        jpg = bytes[a:b+2]
        bytes= bytes[b+2:]
        frame = cv2.imdecode(np.fromstring(jpg, dtype=np.uint8),cv2.IMREAD_COLOR)
        small_frame = cv2.resize(frame, (0,0), fx=.25, fy=.25)
        if process_this_frame:
               face_locations = face_recognition.face_locations(small_frame)
               face_encodings = face_recognition.face_encodings(small_frame, face_locations)
               face_names=[]
               other = 0
               name ='';
               for face_encoding in face_encodings:
                  match = face_recognition.compare_faces(known_encodings, face_encoding)
                  name = "Unknown"
                  for i in range(len(match)):
                    if match[i]:
                        name = people[i]
                        break
                  if "Unknown" in name:
                      other += 1
                      name += str(other)
               face_names.append(name)
               print(face_names)
        process_this_frame = not process_this_frame
        for (top, right, bottom, left),name in zip(face_locations, face_names):
           top *= 4
           right *= 4
           bottom *= 4
           left *= 4
           color = (0,255,0)
           if not authorised(name):
               color = (0,0,255)
           cv2.rectangle(frame, (left,top), (right,bottom), color, 2)
           cv2.rectangle(frame, (left,bottom-35), (right, bottom), color, cv2.FILLED)
           font = cv2.FONT_HERSHEY_DUPLEX
           cv2.putText(frame, name,(left+6, bottom-6), font, 1.0, (255,255,255), 1)
        cv2.imshow('i',frame)
        if cv2.waitKey(1) ==27:
            exit(0)   
main()
