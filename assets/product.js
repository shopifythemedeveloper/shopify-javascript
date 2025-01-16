document.querySelector('.shopify-product-form').addEventListener('submit', function(evt) {
    evt.preventDefault();

    let formData = new FormData(this);
    fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        return response.json();
    })
    .then(json_response => {
        console.log(json_response);
        alert('One '+json_response.product_title+' added to the cart ✓')
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

document.querySelector('.shopify-product-form').addEventListener('input', function(evt) {
    const variants = JSON.parse(document.getElementById('product-variants-json').innerText);
    const current_variant_id = document.querySelector('input[name="id"]:checked').value;
    const current_variant = variants.find(variant => variant.id == current_variant_id);
    console.log(current_variant);

    document.querySelector('.product-price').innerText = Shopify.formatMoney(current_variant.price);
    document.querySelector('.product-image').src = current_variant.featured_image.src + '&width=400';
    if(!current_variant.available) {
        this.querySelector('input[type="submit"]').setAttribute('disabled', '');
        this.querySelector('input[type="submit"]').value = 'SOLD OUT';
    } else {
        this.querySelector('input[type="submit"]').removeAttribute('disabled');
        this.querySelector('input[type="submit"]').value = 'Add to cart';
    }
})

class ProductPage extends HTMLElement {
    constructor() {
        super();

        this.formElement = this.querySelector('form');
        this.productHandle = this.getAttribute('handle');
        this.variants = JSON.parse(this.querySelector('#product-variants-json').innerText);
        this.currentVariant = this.variants.find(variant => variant.id == this.querySelector('input[name="id"]').value);
        console.log(this.variants);

        this.addEventListener('submit', this.handleFormSubmit.bind(this));
        // this.addEventListener('input', this.variantFromOptionValues.bind(this));
        this.addEventListener('input', this.updateVariant.bind(this));

        this.setSelectedOptionsFromVariant();
    }
    
    handleFormSubmit(evt) {
        evt.preventDefault();

        let formData = new FormData(this.formElement);
        document.querySelector('side-cart').classList.remove('loaded');
        fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            return response.json();
        })
        .then(json_response => {
            console.log(json_response);
            if(json_response.status != 'bad_request') {
                // alert('One '+json_response.product_title+' added to the cart ✓');
                document.querySelector('side-cart').addLineItem(json_response);
            } else {
                alert('Error: '+json_response.message);
            }
        })
        .catch((error) => {
            alert('Error: '+error);
            console.error('Error:', error);
        });
    }

    variantFromOptionValues() {
        const option1 = this.querySelector('select[name="option1"]')?.value || null;
        const option2 = this.querySelector('select[name="option2"]')?.value || null;
        const option3 = this.querySelector('select[name="option3"]')?.value || null;

        return this.variants.find(variant => 
            variant.option1 == option1 &&
            variant.option2 == option2 &&
            variant.option3 == option3
        );
    }

    updateVariant() {
        this.currentVariant = this.variantFromOptionValues();
        // 1. Update the hidden variant field
        this.querySelector('input[name="id"]').value = this.currentVariant.id;

        // 2. Update history state
        window.history.replaceState({}, '', `/products/${this.productHandle}?variant=${this.currentVariant.id}`);

        // 3. Update image
        this.querySelector('.product-image').src = this.currentVariant.featured_image.src+'&width=400';

        // 4. Update price
        this.querySelector('.product-price').innerText = Shopify.formatMoney(this.currentVariant.price);

        // 5. Update button state
        const inputButton = this.querySelector('input[type="submit"]');
        if(!this.currentVariant.available) {
            inputButton.setAttribute('disabled', '');
            inputButton.value = 'SOLD OUT';
        } else {
            inputButton.removeAttribute('disabled');
            inputButton.value = 'Add to cart';
        }
    }

    setSelectedOptionsFromVariant() {
        if(this.currentVariant) {
            if(this.querySelector('select[name="option1"]') && this.currentVariant.option1) this.querySelector('select[name="option1"]').value = this.currentVariant.option1;
            if(this.querySelector('select[name="option2"]') && this.currentVariant.option2) this.querySelector('select[name="option2"]').value = this.currentVariant.option2;
            if(this.querySelector('select[name="option3"]') && this.currentVariant.option3) this.querySelector('select[name="option3"]').value = this.currentVariant.option3;
        }
    }
}

customElements.define('product-page', ProductPage);