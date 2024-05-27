class SideCartItem extends HTMLElement {
    constructor() {
        super();

        this.variant_id = this.getAttribute('variant-id');
        this.item_count = Number(this.getAttribute('item-count'));

        this.side_cart = this.closest('side-cart');

        this.querySelector('.cart-item-qty-minus').addEventListener('click', this.minusQty.bind(this));
        this.querySelector('.cart-item-qty-plus').addEventListener('click', this.addQty.bind(this));
        this.querySelector('.cart-item-delete').addEventListener('click', this.clearLineItem.bind(this));
    }

    updateCart(updates) {
        this.side_cart.classList.remove('loaded');
          fetch(window.Shopify.routes.root + 'cart/update.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ updates })
          })
          .then(response => {
            return response.json();
          })
          .then(json_response => {
            this.side_cart.cart = json_response;
            this.side_cart.buildCart();
            this.side_cart.classList.add('loaded');
          })
          .catch((error) => {
            console.error('Error:', error);
          });
    }
    
    addQty() {
        let updates = {};
        updates[this.variant_id] = this.item_count + 1;
        this.updateCart(updates);
    }
    
    minusQty() {
        let updates = {};
        updates[this.variant_id] = this.item_count - 1;
        this.updateCart(updates);
    }
    
    clearLineItem() {
        let updates = {};
        updates[this.variant_id] = 0;
        this.updateCart(updates);
    }
}

customElements.define('side-cart-item', SideCartItem);

class SideCart extends HTMLElement {
    constructor() {
        super();
        
        this.cart = {};
        this.getCart();
    }

    getCart() {
        fetch(window.Shopify.routes.root + 'cart.js')
            .then(response => response.json())
            .then(data => { 
                this.cart = data;
                this.buildCart();
            });
    }

    buildCart() {
        console.log(this.cart);

        this.querySelector('.side-cart-items').innerHTML = '';

        this.cart.items.forEach(item => {
            this.querySelector('.side-cart-items').innerHTML += `
                <side-cart-item variant-id="${item.id}" item-count="${item.quantity}">
                    <div>
                        <img 
                            src="${item.featured_image.url}&width=100"
                            alt="${item.featured_image.alt}"
                            style="aspect-ratio: ${item.featured_image.aspect_ratio}">
                    </div>
                    <div>
                        <strong>${item.product_title}</strong>
                        ${(!item.product_has_only_default_variant) ? `<div>${item.variant_title}</div>` : ''}
                        <div class="cart-item-qty">
                            <span class="cart-item-qty-minus">-</span>
                            ${item.quantity}
                            <span class="cart-item-qty-plus">+</span>
                        </div>
                    </div>
                    <div>

                    <div>
                        ${Shopify.formatMoney(item.final_line_price)}
                    </div>
                        
                    </div>
                    <div class="cart-item-delete">
                        <span>X</span>
                    </div>
                </side-cart-item>
            `;
        });

        this.querySelector('.side-cart-totals').innerHTML = `
            <div></div>
            <div>Total:</div>
            <div>${Shopify.formatMoney(this.cart.total_price)}</div>
        `;
        this.classList.add('loaded');
    }

    addLineItem(line_item) {
        const existingLineItem = this.cart.items.find(item => item.id == line_item.id);

        if(existingLineItem) {
            existingLineItem.quantity = line_item.quantity;
            existingLineItem.final_line_price = line_item.final_line_price;
        } else {
            this.cart.items.push(line_item);
        }

        const accumulate = (items, prop) => {
            return items.reduce( function(a, b){
                return a + b[prop];
            }, 0);
        }
    
        this.cart.total_price = accumulate(this.cart.items, 'final_line_price');
        
        this.buildCart(this.cart);

        // the easy way => this.getCart();
    }
}

customElements.define('side-cart', SideCart);