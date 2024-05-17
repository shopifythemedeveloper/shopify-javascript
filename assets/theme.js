class CustomComponent extends HTMLElement {
    constructor() {
        super();
        
        this.link_color = this.getAttribute('link_color');
    }

    connectedCallback() {
        console.log(this);
        const self = this;
        setTimeout(function() {
            self.querySelector('span').style.color = self.link_color;
        }, 1000);
    }
}

customElements.define('custom-component', CustomComponent);