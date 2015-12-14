#encoding:utf-8
from django.http import HttpResponse
import json
import re
import upload
import os




def handle(req):
    '''
    读取配置文件获得字典
    '''
    file = os.path.dirname(__file__)+'/config.json'
    fp = open(file, 'r')
    str = fp.read()
    # reobj = re.compile(r"/*(.*?)*/")
    output = re.sub("\/\*[\s\S]+?\*\/", "", str)

    dict = json.loads(output, encoding="utf-8")
    fp.close()

    action = req.GET.get('action')
    print action
    if action == "config":
        result = json.dumps(dict)
    if action == 'uploadimage':
        # print action
        result = upload.ueditor_ImgUp(req)
        print result
    return HttpResponse(result)
