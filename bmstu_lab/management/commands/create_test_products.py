import base64
import os
from pathlib import Path

from django.core.management.base import BaseCommand

from bmstu_lab.models import Product, Shop
from isit import settings


class Command(BaseCommand):
    help = 'Создание тестовых товаров'

    def handle(self, *args, **kwargs):
        Product.objects.all().delete()

        shops = list(Shop.objects.all())
        image_folder = os.path.join(settings.MEDIA_ROOT)

        image_files = [
            'hammer.jpg', 'saw.jpg', 'wrench.jpeg', 'pliers.jpg', 'screwdriver.jpg',
            'drill.jpg', 'tape_measure.png', 'jigsaw.jpg', 'chisel.jpg', 'clippers.jpg'
        ]

        products_data = [
            {'name': 'Молоток', 'price': 300, 'stock': 25, 'description': 'Прочный молоток', 'image': image_files[0]},
            {'name': 'Пила', 'price': 500, 'stock': 10, 'description': 'Ручная пила', 'image': image_files[1]},
            {'name': 'Гаечный ключ', 'price': 250, 'stock': 40, 'description': 'Удобный ключ', 'image': image_files[2]},
            {'name': 'Плоскогубцы', 'price': 200, 'stock': 35, 'description': 'Плоскогубцы для работы',
             'image': image_files[3]},
            {'name': 'Отвёртка', 'price': 150, 'stock': 50, 'description': 'Фигурная отвёртка',
             'image': image_files[4]},
            {'name': 'Дрель', 'price': 2000, 'stock': 5, 'description': 'Электрическая дрель', 'image': image_files[5]},
            {'name': 'Рулетка', 'price': 120, 'stock': 60, 'description': 'Рулетка на 5 метров',
             'image': image_files[6]},
            {'name': 'Электролобзик', 'price': 180, 'stock': 22, 'description': 'Строительный электролобзик',
             'image': image_files[7]},
            {'name': 'Зубило', 'price': 100, 'stock': 30, 'description': 'Зубило для дерева', 'image': image_files[8]},
            {'name': 'Кусачки', 'price': 600, 'stock': 12, 'description': 'Отличные кусачки', 'image': image_files[9]},
        ]

        for i, data in enumerate(products_data):
            image_path = os.path.join(image_folder, data['image'])

            image_base64 = get_image_base64(image_path)
            product = Product.objects.create(
                name=data['name'],
                price=data['price'],
                stock=data['stock'],
                description=data['description'],
                image=image_base64,
            )
            product.shops.set([shops[i % len(shops)]])

        self.stdout.write(self.style.SUCCESS('✔ Добавлены демонстрационные товары'))

def get_image_base64(filename):
    path = Path('products/media/tools') / filename
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')
