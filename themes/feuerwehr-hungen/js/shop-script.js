
let productsList;
let products = [];
let cart = []

document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.product-list');
    productsList = JSON.parse(carousel.getAttribute('data-list'));
    products = extractProducts(productsList);

    let adultProducts = products.filter(product => product.category === "adult");
    let kidsProducts = products.filter(product => product.category === "kids");

    // Build HTML for adult products
    const adultProductsHTML = buildProductHTML(adultProducts);
    // Build HTML for kids products
    const kidsProductsHTML = buildProductHTML(kidsProducts);

    // Start with adult products
    const result = document.querySelector(".result");
    result.innerHTML = adultProductsHTML.join("");

    // Add listeners
    updateCart();

    attachEventListenersToCart();

    attachAddToCartListeners();

    attachEventListenersToCategoryButtons();
    attachEventListenersToSexButtons();

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
        setTotal(cart);
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

    // Add category switcher
    function attachEventListenersToCategoryButtons() {

        const adultButton = document.querySelector("#adult-btn");
        const kidsButton = document.querySelector("#kids-btn");

        adultButton.addEventListener("click", function () {
            const popups = document.querySelectorAll('.popup');
            popups.forEach(popup => {
                popup.classList.remove('pop-out');
                popup.classList.add('pop-in');
            });

            result.innerHTML = adultProductsHTML;

            adultButton.classList.add("active");
            kidsButton.classList.remove("active")
        });

        kidsButton.addEventListener("click", function () {
            const popups = document.querySelectorAll('.popup');
            popups.forEach((popup) => {
                popup.classList.remove('pop-in');
                popup.classList.add('pop-out');
            });

            result.innerHTML = kidsProductsHTML;

            adultButton.classList.remove("active");
            kidsButton.classList.add("active")
        });
    }

    function attachEventListenersToSexButtons() {
        const maleButton = document.getElementById("male-btn");
        const femaleButton = document.getElementById("female-btn");

        const femaleProductsHTML = buildProductHTML(adultProducts.filter(product => product.name.toLowerCase().includes("damen")));
        const maleProductsHTML = buildProductHTML(adultProducts.filter(product => !product.name.toLowerCase().includes("damen")));


        maleButton.addEventListener("click", function() {
            result.innerHTML = maleProductsHTML;
            maleButton.classList.add("active");
            femaleButton.classList.remove("active")
        });

        femaleButton.addEventListener("click", function() {
            result.innerHTML = femaleProductsHTML;
            femaleButton.classList.add("active");
            maleButton.classList.remove("active")
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
        return {totalItem, cartTotal}
    }

    function setTotal(cart) {
        let {totalItem, cartTotal} = getTotal(cart);

        const totalItemsHTML = document.querySelector(".noOfItems");
        const mobileTotalItemsHTML = document.querySelector(".mobile-noOfItems");
        if (mobileTotalItemsHTML !== null) {
            mobileTotalItemsHTML.innerHTML = `${totalItem} Produkte`;

        }
        totalItemsHTML.innerHTML = `${totalItem} Produkte`;
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
        setTotal(cart);
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
        setTotal(cart);
    }

    function deleteItem(id, size) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id && cart[i].size === size) {
                cart.splice(i, 1);
                break;
            }
        }
        updateCart();
        setTotal(cart);
    }

    // *********************************//
    // Cart logic with modal and order
    // *********************************//

    const buyButton = document.querySelector(".buy-btn");
    const orderModal = document.getElementById("orderModal");
    const orderConfirmationContent = document.getElementById("orderConfirmationContent");
    const orderSuccessContent = document.getElementById("orderSuccessContent");
    const orderNamePlaceholder = document.getElementById("orderNamePlaceholder");
    const finalizeOrderButton = document.getElementById("finalizeOrderBtn");
    const closeOrderModalButton = document.getElementById("closeOrderModalBtn");
    const closeButton = orderModal.querySelector(".close-button");

    // Mobile cart constants
    const mobileCartButton = document.querySelector(".mobile-cart-button");
    const cartElement = document.querySelector(".cart");
    const buttonContentPlaceholder = mobileCartButton.querySelector(".button-content-placeholder");
    // initial button content
    const initialButtonContent = document.createElement('span');
    initialButtonContent.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Warenkorb (<span class="mobile-noOfItems noOfItems">0 Produkte</span>)';


    buyButton.addEventListener("click", function () {
        const nameInput = document.getElementById("csv-name");
        const orderName = nameInput.value;

        if (!orderName) {
            nameInput.style.border = "1px solid red";
            return; // Verhindere das Öffnen des Modals, wenn Name fehlt
        } else {
            nameInput.style.border = "";
        }

        if (cartElement.classList.contains('cart--open')) {
            cartElement.classList.remove('cart--open');
            mobileCartButton.classList.remove('cart--open-button');
            buttonContentPlaceholder.innerHTML = '';
            buttonContentPlaceholder.appendChild(initialButtonContent);
        }

        // Show customer name for order
        orderNamePlaceholder.textContent = orderName;


        let {totalItem, cartTotal} = getTotal(cart);
        const orderTotalPriceElement = document.getElementById("orderTotalPrice");
        orderTotalPriceElement.textContent = `Gesamtpreis: ${cartTotal.toFixed(2)}€`;

        orderConfirmationContent.style.display = "block";
        orderSuccessContent.style.display = "none";
        orderModal.style.display = "block";

    });

    finalizeOrderButton.addEventListener("click", function() {
        saveCartToCSV().then(success => {
            if (success) {
                orderConfirmationContent.style.display = "none";
                orderSuccessContent.style.display = "block";

                cart = [];
                updateCart();
                setTotal(cart);
                const nameInput = document.getElementById("csv-name");
                nameInput.value = '';


                setTimeout(() => {
                    orderModal.style.display = "none";
                }, 10000);

            } else {
                console.error("Bestellung nicht erfolgreich gespeichert (CSV Fehler)");
                alert("Bestellung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.");
            }
        });
    });

    //Modal closing logic
    closeOrderModalButton.addEventListener("click", function() {
        orderModal.style.display = "none";
    });
    closeButton.addEventListener("click", function() {
        orderModal.style.display = "none";
    });
    window.addEventListener("click", function(event) {
        if (event.target == orderModal) {
            orderModal.style.display = "none";
        }
    });



    // "X" icon element
    const closeButtonContent = document.createElement('i');
    closeButtonContent.className = 'fa-solid fa-xmark';

    buttonContentPlaceholder.appendChild(initialButtonContent);

    mobileCartButton.addEventListener("click", function() {

        const cartWasOpenBeforeClick = cartElement.classList.contains('cart--open');

        cartElement.classList.toggle('cart--open');
        mobileCartButton.classList.toggle('cart--open-button');

        // JavaScript to toggle button content
        if (!cartWasOpenBeforeClick) {
            buttonContentPlaceholder.innerHTML = '';
            buttonContentPlaceholder.appendChild(closeButtonContent);
        } else {
            buttonContentPlaceholder.innerHTML = '';
            buttonContentPlaceholder.appendChild(initialButtonContent);
        }


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
                mobileCartButton.classList.remove('cart--open-button');
                buttonContentPlaceholder.innerHTML = '';
                buttonContentPlaceholder.appendChild(initialButtonContent);
            }
        }
    });

});

function extractProducts(data) {
    const products = [];

    for (const key in data) {
        const productData = data[key];
        const category = productData.category;
        let sizes;
        if (category == "kids") {
            sizes = getTrueSizes(productData.size0);
        } else if (category == "adult") {
            sizes = getTrueSizes(productData.size1);
        } else if (category == null) {
            sizes = getTrueSizes(productData.size);
        }
        let imageName = "";
        if (productData.productImage) {
            imageName = productData.productImage;
        }

        const product = {
            id: key,
            name: productData.name,
            category: category,
            price: productData.price,
            sizes: sizes,
            imageName: imageName,
        };

        products.push(product);
    }

    return products;
}

function buildProductHTML(products) {
    return products.map(product => {
        return `
            <div class="product-card">
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
            </div>`;
    });
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
            return true;

        } else {
            console.error('Failed to save CSV:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error saving CSV:', error);
    }
}