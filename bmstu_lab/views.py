import base64

from django.shortcuts import render, get_object_or_404
from .models import Product, Shop, Inventory
from .forms import ProductForm, ShopForm, InventoryFormSet


def base(request):
    return render(request, 'base.html')

def home_partial(request):
    return render(request, 'partials/home_partial.html')

def product_list_partial(request):
    limit = request.GET.get('limit', '')
    products = Product.objects.all()
    if limit.isdigit():
        products = products[:int(limit)]
    return render(request, 'partials/product_list_partial.html', {'products': products})

def product_detail_partial(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    return render(request, 'partials/product_detail_partial.html', {'product': product})

def delete_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    products = Product.objects.all()
    return render(request, 'partials/product_list_partial.html', {'products': products})


def add_product_partial(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        shops = request.POST.getlist('shops')
        stocks = request.POST.getlist('stocks')

        if form.is_valid():
            product = form.save()

            Inventory.objects.filter(product=product).delete()

            for shop_id, stock in zip(shops, stocks):
                if shop_id and stock:
                    Inventory.objects.create(
                        product=product,
                        shop_id=int(shop_id),
                        stock=int(stock)
                    )

            products = Product.objects.all()
            return render(request, 'partials/product_list_partial.html', {'products': products})

    else:
        form = ProductForm()

    shops = Shop.objects.all()
    return render(request, 'partials/add_product_partial.html', {'form': form, 'shops': shops})


def shop_list_partial(request):
    shops = Shop.objects.prefetch_related('products').all()
    return render(request, 'partials/shop_list_partial.html', {'shops': shops})


def add_shop_partial(request):
    if request.method == 'POST':
        form = ShopForm(request.POST)
        if form.is_valid():
            form.save()
            shops = Shop.objects.all()
            return render(request, 'partials/shop_list_partial.html', {'shops': shops})
    else:
        form = ShopForm()

    return render(request, 'partials/add_shop_partial.html', {'form': form})


def delete_shop_partial(request, shop_id):
    shop = get_object_or_404(Shop, id=shop_id)

    for inventory in Inventory.objects.filter(shop=shop):
        product = inventory.product
        inventory.delete()
        if product.inventories.count() == 0:
            product.delete()

    shop.delete()
    shops = Shop.objects.prefetch_related('products').all()
    return render(request, 'partials/shop_list_partial.html', {'shops': shops})


def edit_product_partial(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    shops = Shop.objects.all()

    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES, instance=product)
        formset = InventoryFormSet(request.POST, instance=product)

        if form.is_valid() and formset.is_valid():
            product = form.save(commit=False)
            image_file = request.FILES.get('image_file')
            if image_file:
                product.image = base64.b64encode(image_file.read()).decode('utf-8')
            product.save()
            formset.save()
            return render(request, 'partials/product_detail_partial.html', {'product': product})
    else:
        form = ProductForm(instance=product)
        formset = InventoryFormSet(instance=product)

    return render(request, 'partials/edit_product_partial.html', {'form': form, 'formset': formset, 'product': product, 'shops': shops})


def set_inventory_partial(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.method == 'POST':
        formset = InventoryFormSet(request.POST, queryset=Inventory.objects.none())
        if formset.is_valid():
            for form in formset:
                if form.cleaned_data.get('shop') and form.cleaned_data.get('stock') is not None:
                    Inventory.objects.create(
                        product=product,
                        shop=form.cleaned_data['shop'],
                        stock=form.cleaned_data['stock']
                    )
            return render(request, 'partials/product_detail_partial.html', {'product': product})
    else:
        formset = InventoryFormSet(queryset=Inventory.objects.none())

    return render(request, 'partials/set_inventory_partial.html', {'formset': formset, 'product': product})

def shop_products_partial(request, shop_id):
    shop = get_object_or_404(Shop, id=shop_id)
    return render(request, 'partials/shop_products_partial.html', {'shop': shop})

