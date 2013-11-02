from django.conf.urls import patterns, include, url
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'wikifetch.views.home', name='home'),
    url(r'^fetchWiki/$', 'wikifetch.views.fetchWiki', name='fetchWiki'),
    url(r'^fetchArticle/$', 'wikifetch.views.fetchArticle', name='fetchArticle'),
)