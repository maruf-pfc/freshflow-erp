from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, UserRole


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user_data = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "role": self.user.role,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
        }
        if hasattr(self.user, "restaurant"):
            user_data["restaurant_id"] = self.user.restaurant.id
            user_data["tier"] = self.user.restaurant.tier
        profile = getattr(self.user, "employee_profile", None)
        if profile and profile.profile_picture:
            request = self.context.get("request")
            if request:
                user_data["profile_picture_url"] = request.build_absolute_uri(
                    profile.profile_picture.url
                )
            else:
                user_data["profile_picture_url"] = profile.profile_picture.url
        else:
            user_data["profile_picture_url"] = None
        data["user"] = user_data
        return data


class UserSerializer(serializers.ModelSerializer):
    restaurant_id = serializers.SerializerMethodField()
    tier = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "phone_number",
            "first_name",
            "last_name",
            "restaurant_id",
            "tier",
            "profile_picture_url",
        ]
        read_only_fields = ["id", "role"]

    def get_restaurant_id(self, obj):
        return getattr(getattr(obj, "restaurant", None), "id", None)

    def get_tier(self, obj):
        return getattr(getattr(obj, "restaurant", None), "tier", None)

    def get_profile_picture_url(self, obj):
        profile = getattr(obj, "employee_profile", None)
        if profile and profile.profile_picture:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(profile.profile_picture.url)
            return profile.profile_picture.url
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role", "phone_number"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        # Default role for public self-registration is RESTAURANT_CLIENT
        role = validated_data.get("role", UserRole.RESTAURANT_CLIENT)
        if role not in UserRole.values:
            role = UserRole.RESTAURANT_CLIENT
        validated_data["role"] = role
        user = User.objects.create_user(password=password, **validated_data)
        return user
