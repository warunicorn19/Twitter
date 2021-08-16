from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class UserInfo(models.Model):
    user = models.OneToOneField("User", on_delete=models.CASCADE, primary_key=True, related_name='user_info')
    followers = models.ManyToManyField("User", related_name="user_followers")
    following = models.ManyToManyField("User", related_name="user_following")

    def serialize(self):
        return {
            "user": self.user.id,
            "followers": [user.username for user in self.followers.all()],
            "following": [user.username for user in self.following.all()]
        }
    
    def __str__(self):
        follower_num = len(self.followers.all())
        following_num = len(self.following.all())
        followers = [user.username for user in self.followers.all()]
        following = [user.username for user in self.following.all()]
        return f"{self.user.username} has {follower_num} followers ({followers}) and following {following_num} people ({following})."

class Post(models.Model):
    poster = models.ForeignKey("User", on_delete=models.CASCADE, related_name='user_posting')
    content = models.TextField(blank=False)
    liked = models.ManyToManyField("User", blank=True, related_name='liked_users')
    unliked = models.ManyToManyField("User", blank=True, related_name='unliked_users')
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "poster": self.poster.username,
            "content": self.content,
            "liked": [user.username for user in self.liked.all()],
            "unliked": [user.username for user in self.unliked.all()],
            "timestamp": self.timestamp.strftime("%b %-d %Y, %_I:%M %p")
        }
    
    def __str__(self):
        liked = [user.username for user in self.liked.all()]
        unliked = [user.username for user in self.unliked.all()]
        return f"Post {self.id} by {self.poster.username}. Liked by {liked} and unliked by {unliked}."