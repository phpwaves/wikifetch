
            <h1 id="tutorial-1-serialization">Overview: Wikifetch</h1>
<h2 id="introduction">Introduction</h2>
<p>This tutorial will cover creating a simple wiki scrape code for highlighting Python Django REST Framework Web API.<br/> </p><p> Along the way it will make you understand how to create new django REST based applicaiton to fetch wikipedia Revision history details dynamically related to any wikipedia article and display article information upon revision selection.</p>

<hr />
<p><strong>Note</strong> <a href="http://webxanimation.com/api/> available here</a>.</p>
<hr />
<h2 id="setting-up-a-new-environment">Requirements</h2>
<ul>
<li>Python (2.6.5+, 2.7, 3.2, 3.3)</li>
<li>Django-1.5.4</li>
<li>djangorestframework ( pip install djangorestframework )</li>
<li>BeautifulSoup ( pip install beautifulsoup4)</li>
</ul>

<h2 id="getting-started">Getting started</h2>
<p>Okay, we're ready to get coding.
To get started, let's create a new project to work with.</p>
<pre class="prettyprint lang-py"><code>cd ~
django-admin.py startproject hitachi
cd hitachi
</code></pre>
<p>Once that's done we can create an app that we'll use to create wikifetch Web API.</p>
<pre class="prettyprint lang-py"><code>python manage.py startapp wikifetch
</code></pre>
<p>The simplest way to get up and running will probably be to define STATIC_ROOT and TEMPLATE_DIRS inside settings.py configaration file
<pre class="prettyprint lang-py"><code>
For STATIC_ROOT :
import os
ROOT_PATH = os.path.dirname(__file__)
PROJECT_PATH = os.path.dirname(os.path.abspath(__file__))

STATIC_ROOT = os.path.join(ROOT_PATH, 'static')
STATIC_URL = '/static/'
STATICFILES_DIRS = (( os.path.join('keep your static files dir path', 'static')),)

For TEMPLATE_DIRS : 
TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
)

</code></pre>
<p>We'll also need to add our new <code>wikifetch</code> app and the <code>rest_framework</code> app to <code>INSTALLED_APPS</code>.</p>
<pre class="prettyprint lang-py"><code>INSTALLED_APPS = (
    ...
    'rest_framework',
    'wikifetch',
)
</code></pre>

<p>Okay, we're ready to roll.</p>

<h2 id="creating-a-serializer-class">Creating a Serializer class</h2>
<p>The first thing we need to get started on our Web API is provide a way of serializing and deserializing the wikifetch instances into representations such as <code>json</code>.  We can do this by declaring serializers that work very similar to Django's forms.  Create a file in the <code>wikifetch</code> directory named <code>serializers.py</code> and add the following.</p>
<pre class="prettyprint lang-py"><code>
# Create your serializers here.
from django.forms import widgets
from rest_framework import serializers

class Wikifetch(object):
	def __init__(self, title, versions, url):
		self.title = title
		self.versions = versions
		self.url = url
		
class WikiSerializer(serializers.Serializer):
    title = serializers.CharField(required=False)
    versions = serializers.ChoiceField(required=False)
    url = serializers.CharField(required=False)

    def restore_object(self, attrs, instance=None):
        """
        Restore object for json response
        """
        if instance:
            # Update existing instance
            instance.title = attrs.get('title', instance.title)
            instance.versions = attrs.get('versions', instance.code)
            instance.url = attrs.get('url', instance.linenos)
            return instance

        # Create new instance
        return Wikifetch(**attrs)
</code></pre>
<p>As we are not using any binding relation to models we create Wikifetch class for non relation objects .</p>
<p>The first part of WikiSerializer class defines the fields that get serialized/deserialized.  The <code>restore_object</code> method defines how fully fledged instances get created when deserializing data.</p>

<h2 id="writing-regular-django-views-using-our-serializer">Writing Django views using our Serializer</h2>

<p>We'll start off by creating a subclass of HttpResponse that we can use to render any data we return into <code>json</code>.</p>
<p>Edit the <code>wikifetch/views.py</code> file, and add the following.</p>
<pre class="prettyprint lang-py"><code>
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
	return render_to_response('index.html',
                          {'data': "hello"},
                          context_instance=RequestContext(request))	

</code></pre>

<p>We'll also need couple of views which populates version history details and related content for any submitted url</p>
<pre class="prettyprint lang-py"><code>
@csrf_exempt						  
def fetchWiki(request):

	"""
	An HttpResponse that renders its version history details into JSON.
	We use addheaders just to recover forbidden errors from wikipedia
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
	
	
def home(request):
	"""
	Simple landing page view
	"""
	return render_to_response('index.html',
                          context_instance=RequestContext(request))	
</code></pre>
<p>Finally we need to wire these views up.  update the <code>urls.py</code> file:</p>
<pre class="prettyprint lang-py"><code>from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'wikifetch.views.home', name='home'),
    url(r'^fetchWiki/$', 'wikifetch.views.fetchWiki', name='fetchWiki'),
    url(r'^fetchArticle/$', 'wikifetch.views.fetchArticle', name='fetchArticle'),
)
</code></pre>
<p>fetchWiki and  fetchArticle requestd URLs use jquery ajax implementation and code will be in wikifetch.js inside static files js directory </p>
<h2 id="testing-our-first-attempt-at-a-web-api">Testing our first attempt at a Web API</h2>
<p>Now we can start up a sample server that serves our wikifetch.</p>
<p>...and start up Django's development server.</p>
<pre class="prettyprint lang-py"><code>python manage.py runserver

Validating models...

0 errors found
Django version 1.4.3, using settings 'tutorial.settings'
Development server is running at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
</code></pre>

<p>Finally we can access Revision history details from our landing page from browser</p>
<pre class="prettyprint lang-py"><code>http://127.0.0.1:8000

</code></pre>
