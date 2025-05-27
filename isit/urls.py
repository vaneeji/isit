from django.conf import settings
from django.conf.urls.static import static


from django.contrib import admin
from django.urls import path

from bmstu_lab import views

urlpatterns = [

    path('admin/', admin.site.urls),
    path('', views.base, name='base'),
    path('home_partial/', views.home_partial, name='home_partial'),

    path('products/', views.product_list_partial, name='product_list_partial'),

    path('products/<int:product_id>/', views.product_detail_partial, name='product_detail_partial'),
    path('products/add/', views.add_product_partial, name='add_product_partial'),
    path('shops/', views.shop_list_partial, name='shop_list_partial'),
    path('shops/add/', views.add_shop_partial, name='add_shop_partial'),

    path('shops/<int:shop_id>/delete/', views.delete_shop_partial, name='delete_shop_partial'),
    path('products/edit/<int:product_id>/', views.edit_product_partial, name='edit_product_partial'),
    path('product/<int:product_id>/inventory/', views.set_inventory_partial, name='set_inventory_partial'),
    path('products/<int:product_id>/delete/', views.delete_product, name='delete_product_partial'),
    path('shops/<int:shop_id>/products/', views.shop_products_partial, name='shop_products_partial')


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
