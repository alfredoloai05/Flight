from rest_framework import serializers
from .models import FlightRequest
from destinations.serializers import DestinationSerializer
from destinations.models import Destination


class FlightRequestCreateSerializer(serializers.ModelSerializer):
    origin_id = serializers.PrimaryKeyRelatedField(
        queryset=Destination.objects.all(), source="origin", write_only=True
    )
    destination_id = serializers.PrimaryKeyRelatedField(
        queryset=Destination.objects.all(), source="destination", write_only=True
    )

    class Meta:
        model = FlightRequest
        fields = [
            "id",
            "origin_id",
            "destination_id",
            "travel_date",
            "return_date",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["status", "created_at", "updated_at"]


class FlightRequestListSerializer(serializers.ModelSerializer):
    origin = DestinationSerializer()
    destination = DestinationSerializer()
    owner = serializers.SerializerMethodField()

    class Meta:
        model = FlightRequest
        fields = [
            "id",
            "owner",
            "origin",
            "destination",
            "travel_date",
            "return_date",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_owner(self, obj):
        return {"id": obj.owner.id, "username": obj.owner.username, "email": obj.owner.email}
