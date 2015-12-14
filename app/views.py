#coding=utf-8
from django.shortcuts import render, render_to_response
from django.http import HttpResponse, HttpResponseRedirect
import actions
import json
from deco import checkSession
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
# Create your views here.


'''
控制模板的跳转
'''
@checkSession
def resetPwdView(req):
    userid = req.session.get('userid')
    password = req.session.get('password')
    nickname = getNickname(userid, password)
    return render_to_response("resetPwd.html", {"nickname": nickname})

@checkSession
def articleListView(req):
    userid = req.session.get('userid')
    password = req.session.get('password')
    nickname = getNickname(userid, password)

    page_size =20
    result2 = actions.getlist(userid, password, page=1, page_size=page_size)
    resultDic2 = json.loads(result2) #str转成json
    if resultDic2.get('done') == True:
        count = resultDic2.get('count')
        articleList = resultDic2.get('articles') #返回的文章列表
        # page_size = 100
        # '''
        # 对查询出的文章别表分页
        # '''
        # try:
        #     page = int(req.GET.get("page", 1))
        #     if page < 1:
        #         page = 1
        # except ValueError:
        #     page = 1
        # paginator = Paginator(articleList, page_size)
        # try:
        #     article = paginator.page(page)
        # except(EmptyPage, InvalidPage, PageNotAnInteger):
        #     article = paginator.page(1)
        import math
        if count%20 == 0:
                count = count / 20
        else:
                count = int(count/20) +1
    return render_to_response("article_list.html", {"nickname": nickname, "count":count, "articleList": articleList})

@checkSession
def newArticleView(req):
    userid = req.session.get('userid')
    password = req.session.get('password')
    nickname = getNickname(userid, password)
    return render_to_response("newArticle.html", {"nickname": nickname})

@checkSession
def changeArticleView(req):
    userid = req.session.get('userid')
    password = req.session.get('password')
    nickname = getNickname(userid, password)
    return render_to_response("change.html", {"nickname": nickname})

def index(req):
    return render_to_response("index.html")

'''
判断输入的密码是否和session中密码一致
'''
@checkSession
def getPwd(req):
    password1 = req.POST.get('password')
    password2 = req.session.get('password')
    if password1 == password2:
        result = json.dumps({"done": True})
    else:
        result = json.dumps({"done": False})
    return HttpResponse(result)

'''
获取昵称
'''
def getNickname(userid, password):
    result = actions.login(userid, password)
    resultJson = json.loads(result)
    nickname = resultJson.get('nickname')
    return nickname

'''
获取用户输入的页码
'''
@checkSession
def getPage(req):
    if req.method == 'POST':
        pageNo = req.POST.get('number')
        return HttpResponseRedirect('/author/pageList/?page='+pageNo)


def login(request):
    if request.session.get('userid') is not None:
        userid = request.session.get('userid')
        password = request.session.get('password')
    else:
        userid = request.POST.get('user_number')
        password = request.POST.get('password')
    print userid, password
    result = actions.login(userid, password)
    #nickname传递给前端
    resultJson = json.loads(result)
    if resultJson.get('done') == True:
        request.session['userid'] = userid
        request.session['password'] = password
        nickname = resultJson.get('nickname')
        '''
        将列表数据传给前端
        '''
        page_size = 20
        result2 = actions.getlist(userid, password, page=1, page_size=page_size)
        resultDic2 = json.loads(result2) #str转成json
        if resultDic2.get('done') == True:
            count = resultDic2.get('count') #文章总数
            articleList = resultDic2.get('articles') #返回的文章列表

            # '''
            # 对查询出的文章别表分页
            # '''
            # try:
            #     page = int(request.GET.get("page", 1))
            #     if page < 1:
            #         page = 1
            # except ValueError:
            #     page = 1
            # paginator = Paginator(articleList, page_size)
            # try:
            #     article = paginator.page(page)
            # except(EmptyPage, InvalidPage, PageNotAnInteger):
            #     article = paginator.page(1)
            import math
            if count%20 == 0:
                count = count/20
            else:
                count = int(count/20) +1
            return render_to_response("article_list.html", {'nickname': nickname, "count": count,
                                                            "articleList": articleList})
    else:
        return render_to_response("index.html")

'''
重置密码
'''
@checkSession
def resetPassword(request):
    #从session中取用户id和密码
    userid = request.session.get('userid')
    password = request.session.get('password')
    nickname = getNickname(userid, password)
    print userid, password, nickname
    if request.method == 'POST':
        newPassword = request.POST.get('newPwd1')
        result = actions.resetPwd(userid, password, newPassword)
        resultJson = json.loads(result)
        result = {}
        if resultJson.get('done') == True:
            result['done'] = True
        else:
            result['done'] = False
    return HttpResponse(json.dumps(result))

'''
保存文章
'''
@checkSession
def save(req):
    userid = req.session.get('userid')
    password = req.session.get('password')
    if req.method == 'POST':
        title = req.POST.get('title')
        content = req.POST.get('content')
        from utils.getPicId import getPic
        photos = getPic(content)
        print photos, type(photos)
        result = actions.save(userid, password, title, photos, content)
        resultJson = json.loads(result)
        if resultJson.get('done') == True:
            result = json.dumps({"done": True})
        else:
            result = json.dumps({"done": False})
        return HttpResponse(result)

'''
删除选中的文章
'''
@checkSession
def delete(req):
    userid = req.session.get('userid')
    password = req.session.get('password')
    articleidlist = req.POST.getlist('article_id')[0].split('&')
    for articleid1 in articleidlist:
        articleid = articleid1.split('=')[1]
        result1 = actions.delete(userid, password, articleid)
        result1Json = json.loads(result1)
        if result1Json.get('done') == True:
            result = json.dumps({"done": True})
        else:
            result = json.dumps({"done": False})
            break
    return HttpResponse(result)

@checkSession
def changeArticle1(req):
    articleid = req.POST.get('article_id')
    if articleid is not None:
        result = json.dumps({"done": True})
    else:
        result = json.dumps({"done": False})
    return HttpResponse(result)

'''
修改选中的文章
'''
@checkSession
def changeArticle2(req):
    userid = req.session.get('userid')
    password = req.session.get('password')
    articleid = req.POST.get('article_id')
    result = actions.item(userid, password, articleid)
    return HttpResponse(result)

'''
重新发布文章
'''
@checkSession
def rePostArticle(req):
    '''
    获取被修改的文章id
    '''
    userid = req.session.get('userid')
    password = req.session.get('password')
    articleid = req.POST.get('article_id')
    '''
    获取修改后的标题，内容，照片
    '''
    title = req.POST.get('title')
    content = req.POST.get('content')
    from utils.getPicId import getPic
    photos = getPic(content)
    result = actions.rePostArticle(userid, password, articleid, title, photos, content)
    return HttpResponse(result)

'''
退出系统
'''
def logout(req):
    from django.contrib.auth import logout
    logout(req)
    return render_to_response("index.html")

'''
获得页面文章列表
'''
def getPageList(req):
    page = int(req.GET.get("page", 1))
    userid = req.session.get('userid')
    password = req.session.get('password')
    result = actions.getlist(userid, password, page, page_size=20)
    articleList = json.loads(result).get('articles')
    count = json.loads(result).get('count')
    import math
    if count%20 == 0:
        count = count/20
    else:
        count = int(count/20) +1
    print count
    return render_to_response("article_list.html", {"articleList": articleList, "count": count})
