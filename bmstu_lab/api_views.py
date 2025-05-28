from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Product, Shop, Inventory
from .serializers import (
    ProductSerializer, ShopSerializer, InventorySerializer,
    ProductCreateSerializer, ShopDetailSerializer
)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductCreateSerializer
        return ProductSerializer

    def list(self, request):
        limit = request.query_params.get('limit')
        products = Product.objects.all()

        if limit and limit.isdigit():
            products = products[:int(limit)]

        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def set_inventory(self, request, pk=None):
        product = get_object_or_404(Product, pk=pk)
        inventories = request.data.get('inventories', [])

        # Clear existing inventory
        Inventory.objects.filter(product=product).delete()

        # Create new inventory records
        for inventory_data in inventories:
            if 'shop_id' in inventory_data and 'stock' in inventory_data:
                Inventory.objects.create(
                    product=product,
                    shop_id=inventory_data['shop_id'],
                    stock=inventory_data['stock']
                )

        serializer = ProductSerializer(product)
        return Response(serializer.data)


class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ShopDetailSerializer
        return ShopSerializer

    def list(self, request):
        shops = Shop.objects.prefetch_related('products').all()
        serializer = self.get_serializer(shops, many=True)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        shop = get_object_or_404(Shop, pk=pk)

        # Delete products that exist only in this shop
        for inventory in Inventory.objects.filter(shop=shop):
            product = inventory.product
            inventory.delete()
            if product.inventories.count() == 0:
                product.delete()

        shop.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        shop = get_object_or_404(Shop, pk=pk)
        products = shop.products.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer