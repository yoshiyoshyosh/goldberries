import imgkit
import base64
import sys
import json
import os

arg = sys.argv[1]
content = json.loads(base64.b64decode(arg).decode("utf-8"))

fields = content["fields"]
cookies = []
for field in fields:
  cookies.append((field, base64.b64encode(str(content[field]).encode("utf-8"))))

submissionId = content["submission_id"]
playerName = content["player_name"]

options = {
  "enable-local-file-access": "",
  "enable-javascript": "",
  "encoding": "utf-8",
  "debug-javascript": "",
  "cookie": cookies,
}

# print("Decoded data: ", content)
imgkit.from_file("submission.html", str(submissionId)+".jpg", options=options)

# Move file from current directory to "./submission/{submission_id}.jpg"
os.rename(str(submissionId)+".jpg", "./submission/"+str(submissionId)+".jpg")