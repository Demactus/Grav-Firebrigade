
let productsList;
let products = [];
let cart = []

document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.product-list');
    productsList = JSON.parse(carousel.getAttribute('data-list'));
    products = extractProducts(productsList);

    console.log(products);

    const productsHTML = products.map(
        (product) => `<div class="product-card">
            <img src="/user/images/product-images/${product.imageName}"/>
            <h3 class="product-name">${product.name}</h3>
            <strong>${product.price}€</strong>
            <select class="product-size" id="size-${product.id}">
                ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
            </select>
            <div class="button product-btn">
                <a class="addtocart" id="${product.id}">
                    <div class="add">Hinzufügen</div>
                    <div class="added">Hinzugefügt!</div>
                </a>
            </div>
        </div>`
    );

    const result = document.querySelector(".result");
    result.innerHTML = productsHTML.join("");

    attachAddToCartListeners();

    function attachAddToCartListeners() {
        const productButtons = document.querySelectorAll(".addtocart");
        productButtons.forEach(button => {
            button.addEventListener("click", function () {
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
        const product = products.find((product) => product.id == id);
        const cartProduct = cart.find((product) => product.id == id && product.size === size);
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
                <h5>${item.name} - ${item.size}</h5>
                <div class="cart-detail">
                    <div class="mid">
                        <button data-id="${item.id}" data-size="${item.size}">-</button>
                        <p>${item.quantity}</p>
                        <button data-id="${item.id}" data-size="${item.size}">+</button>
                    </div>
                    <p>${item.price}€</p>
                    <button data-id="${item.id}" data-size="${item.size}" class="cart-product"><i class="fa-solid fa-trash cart-product"></i></button>
                </div>
            </div>`
        );

        const cartItems = document.querySelector(".cart-items");
        cartItems.innerHTML = cartHTML.join("");

        attachEventListenersToCart();
    }

    function attachEventListenersToCart() {
        const cartContainer = document.querySelector(".cart-items");

        cartContainer.addEventListener("click", function (event) {
            const clickedButton = event.target.closest('button');

            if (clickedButton) {
                const itemId = clickedButton.dataset.id;
                const itemSize = clickedButton.dataset.size;

                if (clickedButton.classList.contains('cart-product')) {
                    deleteItem(itemId, itemSize);
                } else if (clickedButton.textContent === "-") {
                    decrItem(itemId, itemSize);
                } else if (clickedButton.textContent === "+") {
                    incrItem(itemId, itemSize);
                }
            }
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
        const mobileTotalItemsHTML = document.querySelector(".mobile-noOfItems");
        console.log(mobileTotalItemsHTML);
        totalItemsHTML.innerHTML = `${totalItem} Produkte`;
        mobileTotalItemsHTML.innerHTML = `${totalItem} Produkte`;
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
            if (cart[i].id == id && cart[i].size === size) {
                if (cart[i].quantity > 1) {
                    cart[i].quantity -= 1;
                } else {
                    deleteItem(id, size);
                }
                break;
            }
        }
        updateCart();
        getTotal(cart);
    }

    function deleteItem(id, size) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id && cart[i].size === size) {
                cart.splice(i, 1);
                break;
            }
        }
        updateCart();
        getTotal(cart);
    }

    const buyButton = document.querySelector(".buy-btn");
    buyButton.addEventListener("click", function () {
        saveCartToCSV();
    });

    const mobileCartButton = document.querySelector(".mobile-cart-button");
    const cartElement = document.querySelector(".cart");

    mobileCartButton.addEventListener("click", function() {
        cartElement.classList.toggle('cart--open');
    });

    document.addEventListener('click', function(event) {
        const cartElement = document.querySelector(".cart");
        const mobileCartButton = document.querySelector(".mobile-cart-button");

        if (cartElement.classList.contains('cart--open')) {
            const isClickInsideCart = cartElement.contains(event.target);
            const isClickOnCartButton = mobileCartButton.contains(event.target);
            const isClickInsideCartControl = event.target.classList.contains('cart-product') || event.target.closest('.cart-product') || event.target.closest('.cart-detail');

            if (!isClickInsideCart && !isClickOnCartButton && !isClickInsideCartControl) {
                cartElement.classList.remove('cart--open');
            }
        }
    });

});

function extractProducts(data) {
    const products = [];

    for (const key in data) {
        const productData = data[key];
        const sizes = getTrueSizes(productData.size);
        let imageName = "";
        if (productData.productImage) {
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

function getTrueSizes(sizes) {
    return Object.keys(sizes).filter(key => sizes[key]);
}

async function saveCartToCSV() {
    if (cart.length === 0) {
        alert("Der Einkaufswagen ist noch leer!");
        return;
    }

    const csvHeader = "Product Name,Size,Quantity,Price\n";
    const csvRows = cart.map(item =>
        `${item.name.replace(",",";")},${item.size},${item.quantity},${item.price.replace(',', '.')}`
    ).join("\n");
    const csvData = csvHeader + csvRows;

    const nameInput = document.getElementById("csv-name");
    const name = nameInput.value;

    if (!name) {
        nameInput.style.border = "1px solid red";
        return;
    } else {
        nameInput.style.border = "";
    }

    try {
        const response = await fetch('/user/save_cart.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `csvData=${encodeURIComponent(csvData)}&filename=${encodeURIComponent(name)}.csv`,
        });

        if (response.ok) {
            console.log("CSV saved successfully!");

            const successMessage = document.createElement("div");
            successMessage.textContent = "Bestellung erfolgreich gespeichert!";
            successMessage.style.color = "green";


            const cartContainer = document.querySelector(".cart");
            cartContainer.prepend(successMessage);

            setTimeout(() => {
                cartContainer.removeChild(successMessage);
            }, 5000);

        } else {
            console.error('Failed to save CSV:', response.status);
        }
    } catch (error) {
        console.error('Error saving CSV:', error);
    }
}