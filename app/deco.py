from django.http import HttpResponseRedirect

def checkSession(f):
    def islogin(req):
        if req.session.get("userid") is None:
            return HttpResponseRedirect("/author/index/")
        else:
            return f(req)
    return islogin