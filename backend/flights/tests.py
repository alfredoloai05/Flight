from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from django.utils import timezone
from destinations.models import Destination
from .models import FlightRequest, FlightAvailability


class FlightAPITests(TestCase):
	def setUp(self):
		U = get_user_model()
		self.user = U.objects.create_user(username="u", password="p", email="u@test.com")
		self.op = U.objects.create_user(username="op", password="p", is_staff=True)
		self.client = APIClient()
		self.client.force_authenticate(self.user)
		self.o = Destination.objects.create(name="Quito", iata_code="UIO", is_active=True)
		self.d = Destination.objects.create(name="Guayaquil", iata_code="GYE", is_active=True)
		# disponibilidad ida y regreso para mañana
		tomorrow = timezone.localdate() + timezone.timedelta(days=1)
		FlightAvailability.objects.create(origin=self.o, destination=self.d, date=tomorrow, is_active=True)
		FlightAvailability.objects.create(origin=self.d, destination=self.o, date=tomorrow, is_active=True)
		self.tomorrow = tomorrow

	def test_create_request_ok(self):
		url = reverse('flight-requests-list')
		resp = self.client.post(url, {
			'origin_id': self.o.id,
			'destination_id': self.d.id,
			'travel_date': str(self.tomorrow),
		}, format='json')
		self.assertEqual(resp.status_code, 201, resp.content)
		self.assertEqual(FlightRequest.objects.count(), 1)

	def test_create_request_invalid_date(self):
		url = reverse('flight-requests-list')
		yesterday = timezone.localdate() - timezone.timedelta(days=1)
		resp = self.client.post(url, {
			'origin_id': self.o.id,
			'destination_id': self.d.id,
			'travel_date': str(yesterday),
		}, format='json')
		self.assertEqual(resp.status_code, 400)

	def test_operator_can_reserve(self):
		# crear solicitud
		r = FlightRequest.objects.create(
			owner=self.user, origin=self.o, destination=self.d, travel_date=self.tomorrow
		)
		# operador marca como RESERVED
		c2 = APIClient(); c2.force_authenticate(self.op)
		url = reverse('flight-requests-reserve', args=[r.id])
		resp = c2.post(url)
		self.assertEqual(resp.status_code, 200)
		r.refresh_from_db()
		self.assertEqual(r.status, FlightRequest.Status.RESERVED)

