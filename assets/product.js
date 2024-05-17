document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.shopify-product-form').addEventListener('input', function(evt) {
        const variants = JSON.parse(document.querySelector('#product-variants-json').innerText);
        const current_variant_id = document.querySelector('#current-variant').value;
        const current_variant = variants.find(variant => variant.id == current_variant_id);
        console.log(current_variant);

        document.querySelector('.product-price').innerText = Shopify.formatMoney(current_variant.price);
        document.querySelector('.product-image').src = current_variant.featured_image.src;
        if(current_variant.featured_image.alt != null) document.querySelector('.product-image').alt = current_variant.featured_image.alt;


        const atcButton = document.querySelector('.atc-button');
        if(current_variant.available) {
            atcButton.removeAttribute('disabled');
            atcButton.innerText = "Add to cart";
        } else {
            atcButton.setAttribute('disabled', '');
            atcButton.innerText = "SOLD OUT";
        }

        const product_handle = document.querySelector('#current-variant').getAttribute('data-product-handle');
        window.history.replaceState({}, '', `/products/${product_handle}?variant=${current_variant_id}`);
    });
});