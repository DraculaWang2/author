#encoding:utf-8
'''
此文件是处理editor中的图片上传，上传路径在/uploads/下
'''
from django.http import HttpResponse
from django.conf import settings
import os
import uuid
import json
import datetime as dt
import requests
from app import config


def ueditor_ImgUp(request):
    result = {"error": 1, "message": "上传出错"}
    uploadFile = request.FILES.get('upfile')
    if uploadFile:
        result1 =image_upload(uploadFile, 'hao')
        if result1.get("error") == 1:
            return HttpResponse(json.dumps(result), content_type="application/json")
        '''
        将保存到本地的图片post到指定接口
        '''
        if uploadFile.content_type == "application/octet-stream":
            uploadFile.content_type = "image/jpeg"
        files = {"file": (result1.get("filename"), open(result1.get("filepath"), "rb"), uploadFile.content_type)}
        print files
        url = config.IMGUP_URL
        userid = request.session.get('userid')
        password = request.session.get('password')
        no_cut = 1
        body = {'user_number': userid, 'password': password, 'no_cut': no_cut}
        res = requests.post(url, data=body, files=files)
        result = res.text
        resultJson = json.loads(result)
        url = config.IMG_URL % resultJson.get("id")
        a = {"url": url, "error": 0, "state": "SUCCESS", "original": uploadFile.name, "title": uploadFile.name}
        try:
            return HttpResponse(json.dumps(a), content_type="application/json")
        finally:
            os.remove(result1.get("filepath"))

#目录创建
def upload_generation_dir(dir_name):
    today = dt.datetime.today()
    dir_name = dir_name + '/%d/%d/' %(today.year, today.month)
    if not os.path.exists(settings.MEDIA_ROOT + dir_name):
        os.makedirs(settings.MEDIA_ROOT + dir_name)
    return dir_name

# 图片上传
def image_upload(files, dir_name):
    #允许上传文件类型
    allow_suffix = ['jpg', 'png', 'jpeg', 'gif', 'bmp']
    file_suffix = files.name.split(".")[-1]
    if file_suffix not in allow_suffix:
        return {"error": 1, "message": "图片格式不正确"}
    relative_path_file = upload_generation_dir(dir_name)
    path = os.path.join(settings.MEDIA_ROOT, relative_path_file)
    if not os.path.exists(path): #如果目录不存在创建目录
        os.makedirs(path)
    file_name = str(uuid.uuid1())+"."+file_suffix
    path_file = os.path.join(path, file_name)
    file_url = settings.MEDIA_URL + relative_path_file + file_name
    open(path_file, 'wb').write(files.file.read()) # 保存图片
    return {"error": 0, "url": file_url, "filename": file_name, "filepath": path_file}
