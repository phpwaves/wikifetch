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
	
