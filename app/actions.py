#coding=utf-8
from django.db import connection,transaction
import hashlib,urllib,urllib2
from app import config


def md5(str):
    import hashlib
    m = hashlib.md5()
    m.update(str)
    return m.hexdigest()
'''
专栏作家登陆
'''
def login(user_number, password):
    passwordMd = md5(password)
    data = {"user_number": user_number, "password": passwordMd}
    data_urlencode = urllib.urlencode(data)
    requrl = config.SERVICE_URL + "login"
    req = urllib2.Request(url=requrl, data=data_urlencode)
    res_data = urllib2.urlopen(req)
    res = res_data.read()
    return res

'''
重置密码
'''
def resetPwd(user_number, password, new_password):
    password1 = md5(password)
    newPassword = md5(new_password)
    data = {"user_number": user_number, "password": password1, "new_password": newPassword}
    data_urlencode = urllib.urlencode(data)
    requrl = config.SERVICE_URL + "resetPwd"
    req = urllib2.Request(url=requrl, data=data_urlencode)
    res_data = urllib2.urlopen(req)
    res = res_data.read()
    return res

'''
获取文章列表
'''
def getlist(user_number, password, page, page_size):
    password1 = md5(password)
    data = {"user_number": user_number, "password": password1, "page": page, "page_size": page_size}
    data_urlencode = urllib.urlencode(data)
    requrl = config.SERVICE_URL + "list"
    req = urllib2.Request(url=requrl, data=data_urlencode)
    # print req
    res_data = urllib2.urlopen(req)
    # print res_data
    res = res_data.read()
    return res
'''
获取文章内容(传递的是文章id参数)
'''
def item(user_number, password, id):
    password1 = md5(password)
    data = {"user_number": user_number, "password": password1, "id": id}
    data_urlencode = urllib.urlencode(data)
    requrl = config.SERVICE_URL + "item"
    req = urllib2.Request(url=requrl, data=data_urlencode)
    # print req
    res_data = urllib2.urlopen(req)
    # print res_data
    res = res_data.read()
    return res

'''
编辑文章后保存
'''
def save(user_number, password, title, photos, content):
    password1 = md5(password)
    data = {"user_number": user_number, "password": password1, "title": title, "photos": photos, "content": content}
    data_urlencode = urllib.urlencode(data)
    requrl = config.SERVICE_URL + "save"
    req = urllib2.Request(url=requrl, data=data_urlencode)
    res_data = urllib2.urlopen(req)
    res = res_data.read()
    return res

'''
文章删除(传入文章id)
'''
def delete(user_number, password, id):
    password1 = md5(password)
    data = {"user_number": user_number, "password": password1, "id": id}
    data_urlencode = urllib.urlencode(data)
    requrl = config.SERVICE_URL + "delete"
    req = urllib2.Request(url=requrl, data=data_urlencode)
    # print req
    res_data = urllib2.urlopen(req)
    # print res_data
    res = res_data.read()
    return res

'''
重新发布文章
'''
def rePostArticle(user_number, password, article_id, title, photos, content):
    password1 = md5(password)
    data = {"user_number": user_number, "password": password1, "id": article_id, "title": title,
            "photos": photos, "content": content}
    data_urlencode = urllib.urlencode(data)
    requrl = config.SERVICE_URL + "save"
    req = urllib2.Request(url=requrl, data=data_urlencode)
    res_data = urllib2.urlopen(req)
    res = res_data.read()
    return res
