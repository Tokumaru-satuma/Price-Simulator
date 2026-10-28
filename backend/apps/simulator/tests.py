from django.test import TestCase

from apps.simulator.models import ContactAddress, ContactAddressHistory, Customer


class ContactAddressHistoryTests(TestCase):
    def test_customer_creation_with_contact_address_creates_history(self):
        contact = ContactAddress.objects.create(
            customer_name="テスト顧客",
            representative_name="山田太郎",
            representative_tel="090-0000-0000",
            representative_address="東京都",
        )
        customer = Customer.objects.create(
            contact_address=contact,
            user_count=20,
            organization_type="団体A",
            broadcast_frequency="週2回",
        )

        self.assertEqual(customer.contact_address, contact)
        self.assertTrue(ContactAddressHistory.objects.filter(contact_address=contact).exists())

    def test_contact_address_update_creates_history_entry(self):
        contact = ContactAddress.objects.create(
            customer_name="元顧客",
            representative_name="旧代表",
            representative_tel="090-1111-1111",
            representative_address="旧住所",
        )

        contact.representative_name = "新代表"
        contact.representative_tel = "090-2222-2222"
        contact.save()

        history = ContactAddressHistory.objects.filter(contact_address=contact).order_by("-created_at").first()
        self.assertIsNotNone(history)
        self.assertEqual(history.previous_snapshot["representative_name"], "旧代表")
        self.assertEqual(history.new_snapshot["representative_name"], "新代表")
