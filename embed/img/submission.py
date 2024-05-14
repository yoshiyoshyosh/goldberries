import imgkit
import base64
import sys
import json
import os

arg = sys.argv[1]
# arg = "eyJzdWJtaXNzaW9uX2lkIjoxMDgyMSwic3VibWlzc2lvbl9pc192ZXJpZmllZCI6dHJ1ZSwic3VibWlzc2lvbl9pc19mYyI6dHJ1ZSwic3VibWlzc2lvbl9kYXRlX2NyZWF0ZWQiOiIyMDI0LTA1LTA5IiwibW9kX2lkIjoiMzkzMjQ1IiwicGxheWVyX25hbWUiOiJ2aWRkaWUiLCJwbGF5ZXJfbmFtZV9jb2xvcl9zdGFydCI6IiNmNDEwMTAiLCJwbGF5ZXJfbmFtZV9jb2xvcl9lbmQiOiIjMDA5NGZmIiwiY2FtcGFpZ25fbmFtZSI6IkRhcmttb29uIFJ1aW5zIiwiY2FtcGFpZ25fYXV0aG9yIjoiQXV0aG9yIE5vdCBSZXRyaWV2ZWQiLCJjaGFsbGVuZ2VfZGVzY3JpcHRpb24iOm51bGwsIm9iamVjdGl2ZV9pY29uX3VybCI6IlwvaWNvbnNcL2dvbGRlbmJlcnJ5LTh4LnBuZyIsImRpZmZpY3VsdHlfaWQiOjIsIndraHRtbHRvaW1hZ2VfcGF0aCI6IkU6XFxQcm9ncmFtIEZpbGVzXFx3a2h0bWx0b3BkZlxcYmluXFx3a2h0bWx0b2ltYWdlLmV4ZSIsImZpZWxkcyI6WyJzdWJtaXNzaW9uX2lkIiwic3VibWlzc2lvbl9pc192ZXJpZmllZCIsInN1Ym1pc3Npb25faXNfZmMiLCJzdWJtaXNzaW9uX2RhdGVfY3JlYXRlZCIsIm1vZF9pZCIsInBsYXllcl9uYW1lIiwicGxheWVyX25hbWVfY29sb3Jfc3RhcnQiLCJwbGF5ZXJfbmFtZV9jb2xvcl9lbmQiLCJjYW1wYWlnbl9uYW1lIiwiY2FtcGFpZ25fYXV0aG9yIiwiY2hhbGxlbmdlX2Rlc2NyaXB0aW9uIiwib2JqZWN0aXZlX2ljb25fdXJsIiwiZGlmZmljdWx0eV9pZCIsIm1hcF9uYW1lIl0sIm1hcF9uYW1lIjoiRGFya21vb24gUnVpbnMifQ=="
content = json.loads(base64.b64decode(arg).decode("utf-8"))

fields = content["fields"]
cookies = []
for field in fields:
  cookies.append((field, base64.b64encode(str(content[field]).encode("utf-8"))))

wkhtmltoimagePath = content["wkhtmltoimage_path"]
# print("wkhtmltoimage_path: ", wkhtmltoimagePath)
config = imgkit.config(wkhtmltoimage=wkhtmltoimagePath)
if(wkhtmltoimagePath != False):
  config.wkhtmltoimage = wkhtmltoimagePath

options = {
  "enable-local-file-access": "",
  "enable-javascript": "",
  "encoding": "utf-8",
  "debug-javascript": "",
  "cookie": cookies,
}


fileName = content["file_name"]
folderName = content["folder_name"]
# print("Decoded data: ", content)
imgkit.from_file("submission.html", str(fileName)+".jpg", options=options, config=config)

# Move file from current directory to "./submission/{submission_id}.jpg"
os.rename(str(fileName)+".jpg", "./"+folderName+"/"+str(fileName)+".jpg")