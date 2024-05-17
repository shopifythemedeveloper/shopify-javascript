document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.shopify-product-form').addEventListener('input', function(evt) {
        const variants = JSON.parse(document.querySelector('#product-variants-json').innerText);

        let current_variant_id = null;

        if(evt.target.id != 'current-variant') {
            const option1 = this.querySelector('select[name="option1"]')?.value || null;
            const option2 = this.querySelector('select[name="option2"]')?.value || null;
            const option3 = this.querySelector('select[name="option3"]')?.value || null;

            const variant_from_options = variants.find(variant => 
                variant.option1 == option1 &&
                variant.option2 == option2 &&
                variant.option3 == option3
            )
            
            current_variant_id = variant_from_options.id;
            document.querySelector('#current-variant').value = current_variant_id;
        }
        
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