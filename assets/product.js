class ProductPage extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.formElement = this.querySelector('form');
        this.handle = this.getAttribute('handle');
        this.atcButton = this.querySelector('.atc-button');
        this.variants = JSON.parse(document.querySelector('#product-variants-json').innerText);
        this.currentVariant = this.variants.find(variant => variant.id == document.querySelector('#current-variant').value);
        
        this.formElement.addEventListener('input', this.updateVariant.bind(this));
        this.formElement.addEventListener('submit', this.handleFormSubmit.bind(this));
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
                document.querySelector('side-cart').addLineItem(json_response);
            } else {
                alert('Error: '+json_response.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    variantFromOptionValues() {
        const option1 = this.querySelector('select[name="option1"]')?.value || null;
        const option2 = this.querySelector('select[name="option2"]')?.value || null;
        const option3 = this.querySelector('select[name="option3"]')?.value || null;

        const variant_from_options = this.variants.find(variant => 
            variant.option1 == option1 &&
            variant.option2 == option2 &&
            variant.option3 == option3
        )
        return variant_from_options;
    }

    updateVariant() {
        this.currentVariant = this.variantFromOptionValues();
        console.log(this.currentVariant);

        // 1. Update the hidden variant field
        document.querySelector('#current-variant').value = this.currentVariant.id;

        // 2. Update history state
        window.history.replaceState({}, '', `/products/${this.handle}?variant=${this.currentVariant.id}`);

        // 3. Update image
        document.querySelector('.product-image').src = this.currentVariant.featured_image.src;
        if(this.currentVariant.featured_image.alt != null) document.querySelector('.product-image').alt = this.currentVariant.featured_image.alt;

        // 4. Update price
        document.querySelector('.product-price').innerText = Shopify.formatMoney(this.currentVariant.price);

        // 5. Update button state
        if(this.currentVariant.available) {
            this.atcButton.removeAttribute('disabled');
            this.atcButton.innerText = "Add to cart";
        } else {
            this.atcButton.setAttribute('disabled', '');
            this.atcButton.innerText = "SOLD OUT";
        }
    }
}

customElements.define('product-page', ProductPage);