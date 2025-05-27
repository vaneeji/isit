from django import forms
from django.forms import modelformset_factory
from django.forms.models import inlineformset_factory

from .models import Product, Shop, Inventory


class ProductForm(forms.ModelForm):
    shops = forms.ModelMultipleChoiceField(queryset=Shop.objects.all(), required=False)
    image_file = forms.ImageField(required=False)

    class Meta:
        model = Product
        fields = ['name', 'price', 'description', 'image_file', 'shops']



class ShopForm(forms.ModelForm):
    class Meta:
        model = Shop
        fields = ['name', 'location']


InventoryFormSet = inlineformset_factory(
    Product, Inventory,
    fields=('shop', 'stock'),
    extra=5,
    can_delete=True
)