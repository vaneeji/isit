from django.db import models


# Create your models here.

class Shop(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'Shop'

class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image = models.TextField()
    shops = models.ManyToManyField(Shop, related_name='products')

    @property
    def total_stock(self):
        return sum(inventory.stock for inventory in self.inventories.all())


    def __str__(self):
        return self.name

    class Meta:
        db_table = 'Product'


class Inventory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventories')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE)
    stock = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('product', 'shop')
