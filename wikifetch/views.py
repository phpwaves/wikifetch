# Create your views here.
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from wikifetch.serializers import WikiSerializer, Wikifetch
from django.template import Context, RequestContext
from django.shortcuts import render_to_response, get_object_or_404, render
from django import http
from django.http import HttpResponseRedirect, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import urllib2, urllib
from bs4 import BeautifulSoup
from django.utils import simplejson

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)
		
def home(request):
	return render_to_response('wiki_index.html',
                          {'data': "hello"},
                          context_instance=RequestContext(request))	

@csrf_exempt						  
def fetchWiki(request):

	"""
	An HttpResponse that renders its version history details into JSON.
	"""
	content = []
	opener = urllib2.build_opener()
	opener.addheaders = [('User-agent', 'Mozilla/24.0')]
	url_id = request.GET['wiki']
	url = 'http://en.wikipedia.org/w/index.php?title='+url_id+'&action=history'
	infile = opener.open(url)
	page = infile.read()
	soup = BeautifulSoup(page)
	data=soup.find_all('a',{'class':'mw-changeslist-date'})
	#06:57, 25 March 2013
	for i in data:
		info = {}
		info['title'] = i.string
		info['versions'] = '1.1'
		info['url'] = i['href']
		info[i.string] = Wikifetch(title=info['title'], versions=info['versions'], url=info['url'])
		content.append(info)
	
	serializer = WikiSerializer(content)
	return JSONResponse(serializer.data)


@csrf_exempt						  
def fetchArticle(request):
	"""
	An HttpResponse that renders its article content into JSON.
	"""
	opener = urllib2.build_opener()
	opener.addheaders = [('User-agent', 'Mozilla/24.0')]
	url_id = request.GET['url']
	oldid = request.GET['oldid']
	url = url_id+'&oldid='+oldid
	infile = opener.open(url)
	page = infile.read()
	soup = BeautifulSoup(page)
	data = soup.find_all('div' ,attrs={'id':'content'})
	response_dict = {}
	for content in data:
		response_dict.update({'article': content.text})
	
	json_data = simplejson.dumps(response_dict)
	return HttpResponse(json_data, mimetype='application/json')
