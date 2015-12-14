#coding=utf-8
from django.conf.urls import patterns, url

import sys
import views
# import upload
# import imageUpload

urlpatterns = patterns('',
    url(r'^resetPwdView/$', views.resetPwdView, name='resetPwdView'), #跳转到重置密码页
    url(r'^articleListView/$', views.articleListView, name='articleListView'), #跳转到文章列表
    url(r'^newArticleView/$', views.newArticleView, name='newArticleView'), #跳转到新建文章
    url(r'^changeArticleView/$', views.changeArticleView, name='changeArticleView'), #跳转到修改文章

    url(r'^getPwd/$', views.getPwd, name='getPwd'),

    url(r'^login/$', views.login, name='login'),
    url(r'^index/$', views.index, name='index'),
    url(r'^resetPwd/$', views.resetPassword, name="resetPwd"), #重置密码
    url(r'^newArticle/$', views.save, name="save"), #新建文章
    url(r'^page/$', views.getPage, name='getPage'), #这个请求处理的是获取页码
    url(r'^delete/$', views.delete, name='delete'), #删除文章
    url(r'^changeArticle1/$', views.changeArticle1, name="changeArticle1"), #这个请求返回result告知是否获取到文章id
    url(r'^changeArticle2/$', views.changeArticle2, name="changeArticle2"), #这个请求给返回选择的文章内容
    url(r'^change/$', views.rePostArticle, name="rePostArticle"), #修改文章
    url(r'^logout/$', views.logout, name="logout"), #注销退出返回到index

    url(r"^pageList/$", views.getPageList, name="getPageList"), #获得页面文章列表
)
