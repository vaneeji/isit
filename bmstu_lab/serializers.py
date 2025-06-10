import logging

from rest_framework import serializers
from .models import Product, Shop, Inventory


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['id', 'name', 'location']


class InventorySerializer(serializers.ModelSerializer):
    shop = ShopSerializer(read_only=True)
    shop_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Inventory
        fields = ['id', 'shop', 'shop_id', 'stock']


class ProductSerializer(serializers.ModelSerializer):
    inventories = InventorySerializer(many=True, read_only=True)
    shops = ShopSerializer(many=True, read_only=True)
    total_stock = serializers.ReadOnlyField()
    image_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'description', 'image', 'image_file',
                  'shops', 'inventories', 'total_stock']

    def create(self, validated_data):
        image_file = validated_data.pop('image_file', None)
        product = Product.objects.create(**validated_data)

        if image_file:
            import base64
            product.image = base64.b64encode(image_file.read()).decode('utf-8')
            product.save()

        return product

    def update(self, instance, validated_data):
        image_file = validated_data.pop('image_file', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if image_file:
            import base64
            instance.image = base64.b64encode(image_file.read()).decode('utf-8')

        instance.save()
        return instance


class ProductCreateSerializer(serializers.ModelSerializer):
    shops_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    image_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = ['name', 'price', 'description', 'image_file', 'shops_data']

    def create(self, validated_data):
        shops_data = validated_data.pop('shops_data', [])
        image_file = validated_data.pop('image_file', None)

        product = Product.objects.create(**validated_data)

        if image_file:
            import base64
            product.image = base64.b64encode(image_file.read()).decode('utf-8')
            product.save()

        for key, value in shops_data:
                Inventory.objects.create(
                    product=product,
                    shop_id=key,
                    stock=value
                )

        return product


class ShopDetailSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Shop
        fields = ['id', 'name', 'location', 'products']