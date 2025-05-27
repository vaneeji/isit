from django.core.management.base import BaseCommand

from bmstu_lab.models import Shop


class Command(BaseCommand):
    help = 'Создает 5 тестовых магазинов'

    def handle(self, *args, **kwargs):
        shop_data = [
            {'name': 'Инструменты+ Москва', 'location': 'Москва, ул. Ленина, 1'},
            {'name': 'СтройМир', 'location': 'Санкт-Петербург, Невский пр., 15'},
            {'name': 'Мастер Инструмент', 'location': 'Екатеринбург, ул. Мира, 25'},
            {'name': 'Дом и Сад', 'location': 'Казань, ул. Баумана, 42'},
            {'name': 'Умелец', 'location': 'Новосибирск, Красный пр., 89'},
        ]

        for shop in shop_data:
            obj, created = Shop.objects.get_or_create(name=shop['name'], defaults={'location': shop['location']})
            if created:
                self.stdout.write(self.style.SUCCESS(f'Создан магазин: {obj.name}'))
            else:
                self.stdout.write(f'Магазин уже существует: {obj.name}')
