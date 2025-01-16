document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        document.getElementById('text').style.color = link_color;
    }, 1000);
});

class CustomComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        console.log(this);
        const self = this;
        setTimeout(function() {
            self.querySelector('span').style.color = self.getAttribute('link_color');
        }, 1000);
    }
}

customElements.define('custom-component',CustomComponent);