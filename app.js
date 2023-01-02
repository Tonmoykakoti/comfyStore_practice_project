const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.products-center')

//cart
let cart = []
//buttons
let buttonsDOM = []

//getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json")
            let data = await result.json()

            let products = data.items
            products = products.map(item => {
                const { title, price } = item.fields
                const { id } = item.sys
                const image = item.fields.image.fields.file.url
                return { title, price, id, image }
            })
            return products
        } catch (error) {
            console.log(error)
        }
    }
}
//display products
class UI {
    displayProducts(products) {
        let result = ''
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
            <img src=${product.image} alt="product" class="product-img">
            <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i>
            add to bag
            </button>
            </div>
            <h3>${product.title}</h3>
            <h4>Rs ${product.price}</h4>
            </article>
            `
        });
        productsDOM.innerHTML = result
    }

    getBagButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')]
        buttonsDOM = buttons
        // console.log(buttons)
        buttons.forEach(button => {
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id)
            if (inCart) {
                button.innerText = 'In Cart'
                button.disabled = true
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = 'In Cart'
                event.target.disabled = true
                //get product from products
                let cartItem = { ...Storage.getProduct(id), amount: 1 }
                //add product to cart
                cart = [...cart, cartItem]
                //save cart to local storage
                Storage.saveCart(cart)
                //set cart values
                this.setCartValues(cart);
                //display cart item
                this.addCartItem(cartItem)
                //show cart
                this.showCart()

            })
        })
    }

    setCartValues(cart) {
        let tempTotal = 0
        let itemsTotal = 0
        cart.map(item => {
            tempTotal += item.price * item.amount
            itemsTotal += item.amount
            // console.log(tempTotal,itemsTotal)
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal
        // console.log(cartTotal, cartItems)

    }
    addCartItem(cart) {
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `
        <img src=${cart.image} alt="product">
        <div>
            <h4>${cart.title}</h4>
            <h5>Rs ${cart.price}</h5>
            <span class="remove-item" data-id=${cart.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${cart.id}></i>
            <p class="item-amount">${cart.amount}</p>
            <i class="fas fa-chevron-down" data-id=${cart.id}></i>
        </div>
        `
        cartContent.appendChild(div)
        // console.log(cartContent)
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('show-cart')
    }
    setupAPP(){
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.populateCart(cart)
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click',this.hideCart)
    }
    populateCart(cart){
        cart.forEach(item => this.addCartItem(item))
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('show-cart')
    }
    cartLogic(){
        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        })
        //cart functionality
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target
                let id = removeItem.dataset.id
                cartContent.removeChild(removeItem.parentElement.parentElement)
               this.removeItem(id)
            }
           else if (event.target.classList.contains('fa-chevron-up')) {
            let addItem = event.target
            let id = addItem.dataset.id
            let tempItem = cart.find(item => item.id === id)
            tempItem.amount = tempItem.amount + 1
            Storage.saveCart(cart)
            this.setCartValues(cart)
            addItem.nextElementSibling.innerText = tempItem.amount
           }
           else if (event.target.classList.contains('fa-chevron-down')) {
            let decreaseItem = event.target
            let id = decreaseItem.dataset.id
            let tempItem = cart.find(item => item.id === id)
            tempItem.amount = tempItem.amount - 1
            if( tempItem.amount > 0){
                Storage.saveCart(cart)
                this.setCartValues(cart)
                decreaseItem.previousElementSibling.innerText = tempItem.amount
            }else {
                cartContent.removeChild(decreaseItem.parentElement.parentElement)
                this.removeItem(id)
            }
           }
        })
    }
    clearCart(){
       let cartItems = cart.map( item => item.id)
       cartItems.forEach(id => this.removeItem(id))
       if(cartContent.children.length > 0){
        cartContent.removeChild(cartContent.children[0])
       }
       this.hideCart()
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id)
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML = `
        <i class="fas fa-shopping-cart"></i>add to cart
        `
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id)
    }

}
//local Storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI()
    const products = new Products()
    ui.setupAPP()
    //getting all products
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.getBagButtons()
        ui.cartLogic()
    })
    // products.getProducts().then( function(products){
    //     ui.displayProducts(products)
    // })
})