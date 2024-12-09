
let productsList;
let products = [];
let cart = []

document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.product-list');
    productsList = JSON.parse(carousel.getAttribute('data-list'));
    products = extractProducts(productsList);

    console.log(products);

    const productsHTML = products.map(
        (product) => `<div class="product-card">
            <img src="user/images/product-images/${product.imageName}"/>
            <h2 class="product-name">${product.name}</h2>
            <strong>${product.price}€</strong>
            <select class="product-size" id="size-${product.id}">
                ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
            </select>
            <div class="button product-btn">
                <a class="addtocart" id="${product.id}">
                    <div class="add">Add to Cart</div>
                    <div class="added">Added!</div>
                </a>
            </div>
        </div>`
    );

    const result = document.querySelector(".result");
    result.innerHTML = productsHTML.join("");

    // Attach event listeners after the product HTML is added to the DOM
    attachAddToCartListeners();

    function attachAddToCartListeners() {
        const productButtons = document.querySelectorAll(".addtocart");
        productButtons.forEach(button => {
            button.addEventListener("click", function (e) {
                // Trigger animation on Add to Cart button click
                $(this).addClass('active');
                setTimeout(function () {
                    $('.addtocart').removeClass('active');
                }, 1000);

                const productId = this.id;
                const sizeSelect = document.getElementById(`size-${productId}`);
                if (sizeSelect) {
                    const selectedSize = sizeSelect.value;
                    addToCart(products, productId, selectedSize);
                } else {
                    console.error(`Size select element not found for product ID: ${productId}`);
                }
            });
        });
    }

    function addToCart(products, id, size) {
        const product = products.find((product) => product.id == id); // Use == for comparison
        const cartProduct = cart.find((product) => product.id == id && product.size === size); // Use == for comparison
        if (cartProduct) {
            incrItem(id, size);
        } else {
            cart.unshift({...product, size: size, quantity: 1});
        }
        updateCart();
        getTotal(cart);
    };

    function updateCart() {
        const cartHTML = cart.map(
            (item) => `<div class="cart-item">
                <h3>${item.name} - ${item.size}</h3>
                <div class="cart-detail">
                    <div class="mid">
                        <button data-id="${item.id}" data-size="${item.size}">-</button>
                        <p>${item.quantity}</p>
                        <button data-id="${item.id}" data-size="${item.size}">+</button>
                    </div>
                    <p>${item.price}€</p>
                    <button data-id="${item.id}" data-size="${item.size}" class="cart-product"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`
        );

        const cartItems = document.querySelector(".cart-items");
        cartItems.innerHTML = cartHTML.join("");

        // Attach event listeners after updating cartHTML
        attachEventListenersToCart();
    }

    function attachEventListenersToCart() {
        // Get all the newly added buttons in the cart
        const buttons = document.querySelectorAll(".cart-item button");

        buttons.forEach(button => {
            button.addEventListener("click", function(e) {
                const itemId = e.target.dataset.id;
                const itemSize = e.target.dataset.size;

                if (e.target.textContent === "-") {
                    decrItem(itemId, itemSize);
                } else if (e.target.textContent === "+") {
                    incrItem(itemId, itemSize);
                } else if (e.target.classList.contains("cart-product")) { // Check for the "D" button using class
                    deleteItem(itemId, itemSize);
                }
            });
        });
    }


    function getTotal(cart) {
        let {totalItem, cartTotal} = cart.reduce(
            (total, cartItem) => {
                const price = parseFloat(cartItem.price.replace(",", ".")); // Convert price to number
                total.cartTotal += price * cartItem.quantity;
                total.totalItem += cartItem.quantity;
                return total;
            },
            {totalItem: 0, cartTotal: 0}
        );
        const totalItemsHTML = document.querySelector(".noOfItems");
        totalItemsHTML.innerHTML = `${totalItem} items`;
        const totalAmountHTML = document.querySelector(".total");
        totalAmountHTML.innerHTML = `${cartTotal.toFixed(2)}€`; // Format total with 2 decimal places
    }

    function incrItem(id, size) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i] && cart[i].id == id && cart[i].size === size) {
                cart[i].quantity += 1;
            }
        }
        updateCart();
        getTotal(cart);
    }

    function decrItem(id, size) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id && cart[i].size === size && cart[i].quantity > 1) {
                cart[i].quantity -= 1;
            }
        }
        updateCart();
        getTotal(cart);
    }

    function deleteItem(id, size) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id && cart[i].size === size) { // Use == for comparison
                cart.splice(i, 1);  // Remove the item from the cart
                break;              // Exit the loop after deleting the item
            }
        }
        updateCart();
        getTotal(cart);
    }

})

function extractProducts(data) {
    const products = [];

    for (const key in data) {
        const productData = data[key];
        const sizes = getTrueSizes(productData.size);
        let imageName = "";
        if (productData.productImage) { // Check if add_image exists
            imageName = productData.productImage;
        }

        const product = {
            id: key,
            name: productData.name,
            price: productData.price,
            sizes: sizes,
            imageName: imageName,
        };

        products.push(product);
    }

    return products;
}
// Helper function to get true sizes from given sizes array
function getTrueSizes(sizes) {
    return Object.keys(sizes).filter(key => sizes[key]);
}




