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
  cookies.append((field, str(content[field])))

submissionId = content["submission_id"]

options = {
  "enable-local-file-access": "",
  "enable-javascript": "",
  "cookie": cookies,
}

imgkit.from_file("submission.html", str(submissionId)+".jpg", options=options)

# Move file from current directory to "./submission/{submission_id}.jpg"
os.rename(str(submissionId)+".jpg", "./submission/"+str(submissionId)+".jpg")