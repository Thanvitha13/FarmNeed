import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminProductName, setAdminProductName] = useState("");
  const [adminProductCategory, setAdminProductCategory] = useState("Seeds");
  const [adminProductCrop, setAdminProductCrop] = useState("All");
  const [adminProductPrice, setAdminProductPrice] = useState("");
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("farmneed-products");

    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [budgetOnly, setBudgetOnly] = useState(false);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("farmneed-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("farmneed-wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  const [compareList, setCompareList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderId, setOrderId] = useState("");

  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem("farmneed-orders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  // Load products
  useEffect(() => {
    const savedProducts = localStorage.getItem("farmneed-products");

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
      return;
    }

    fetch("/products.json")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error loading products:", error));
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem("farmneed-cart", JSON.stringify(cart));
  }, [cart]);

  // Save wishlist
  useEffect(() => {
    localStorage.setItem("farmneed-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Add to cart
  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id,
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // Increase quantity
  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // Remove cart item
  const removeFromCart = (id) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  // Wishlist
  const toggleWishlist = (product) => {
    setWishlist((currentWishlist) => {
      const alreadyAdded = currentWishlist.some(
        (item) => item.id === product.id,
      );

      if (alreadyAdded) {
        return currentWishlist.filter((item) => item.id !== product.id);
      }

      return [...currentWishlist, product];
    });
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => item.id === id);
  };

  // Compare
  const toggleCompare = (product) => {
    setCompareList((currentList) => {
      const alreadyAdded = currentList.some((item) => item.id === product.id);

      if (alreadyAdded) {
        return currentList.filter((item) => item.id !== product.id);
      }

      if (currentList.length >= 3) {
        alert("You can compare up to 3 products.");

        return currentList;
      }

      return [...currentList, product];
    });
  };

  const isInCompare = (id) => {
    return compareList.some((item) => item.id === id);
  };

  // Cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const placeOrder = (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      return;
    }

    const newOrderId = "FN" + Date.now().toString().slice(-8);

    const newOrder = {
      id: newOrderId,
      items: cart,
      total: cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      status: "Confirmed",
      paymentMethod: paymentMethod,
      customer: customer,
      date: new Date().toLocaleDateString(),
    };

    const updatedOrders = [newOrder, ...orders];

    setOrders(updatedOrders);

    localStorage.setItem("farmneed-orders", JSON.stringify(updatedOrders));

    setOrderId(newOrderId);
    setOrderPlaced(true);

    setCart([]);
    localStorage.removeItem("farmneed-cart");
  };
  const cancelOrder = (orderId) => {
    const updatedOrders = orders.filter((order) => order.id !== orderId);

    setOrders(updatedOrders);

    localStorage.setItem("farmneed-orders", JSON.stringify(updatedOrders));
  };

  const saveProducts = (updatedProducts) => {
    setProducts(updatedProducts);

    localStorage.setItem("farmneed-products", JSON.stringify(updatedProducts));
  };
  const addProduct = (event) => {
    event.preventDefault();

    if (!adminProductName || !adminProductPrice) {
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: adminProductName,
      category: adminProductCategory,
      crop: adminProductCrop,
      price: Number(adminProductPrice),
      rating: 4.5,
      image: "/images/default-product.jpg",
      description: "Quality farming product available at FarmNeed.",
    };

    const updatedProducts = [...products, newProduct];

    saveProducts(updatedProducts);

    setAdminProductName("");
    setAdminProductPrice("");
  };
  const deleteProduct = (productId) => {
    const updatedProducts = products.filter(
      (product) => product.id !== productId,
    );

    saveProducts(updatedProducts);
  };
  // Filter products
  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText) ||
      product.crop.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const matchesBudget = !budgetOnly || product.price <= 500;

    return matchesSearch && matchesCategory && matchesBudget;
  });

  return (
    <div className="app">
      {/* Navbar */}

      <div className="navbar">
        <div className="logo">🌱 FarmNeed</div>

        <div className="nav-links">
          <a href="#home">Home</a>

          <a href="#products">Products</a>

          <a href="#categories">Categories</a>

          <a href="#wishlist">Wishlist ❤️ ({wishlist.length})</a>

          <a href="#compare">Compare ⚖️ ({compareList.length})</a>

          <a href="#orders">My Orders</a>

          <a href="#cart">
            Cart 🛒 ({cart.reduce((total, item) => total + item.quantity, 0)})
          </a>

          <a href="#admin" onClick={() => setShowAdmin(true)}>
            Admin
          </a>
        </div>
      </div>

      {/* Hero */}

      <div className="hero" id="home">
        <div className="hero-content">
          <p className="small-title">YOUR FARM, OUR SUPPORT</p>

          <h1>
            Everything Your Farm Needs
            <br />
            In One Place 🌱
          </h1>

          <p>
            Quality seeds, fertilizers, crop protection products and farming
            tools at affordable prices.
          </p>

          <button
            className="shop-button"
            onClick={() => {
              document.getElementById("products").scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Shop Now
          </button>
        </div>

        <div className="hero-image">🌾</div>
      </div>

      {/* Search */}

      <div className="search-area">
        <h2>Find Products for Your Farm</h2>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search seeds, fertilizers, tools..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button>🔍 Search</button>
        </div>
      </div>

      {/* Categories */}

      <div className="categories" id="categories">
        <h2>Shop by Category</h2>

        <p className="category-text">Find the right products for your farm</p>

        <div className="category-grid">
          <div
            className="category-card"
            onClick={() => {
              setSelectedCategory("Seeds");
              setBudgetOnly(false);
            }}
          >
            <div className="category-icon">🌱</div>

            <h3>Seeds</h3>

            <p>Quality seeds for better crops</p>

            <button>Explore</button>
          </div>

          <div
            className="category-card"
            onClick={() => {
              setSelectedCategory("Fertilizers");
              setBudgetOnly(false);
            }}
          >
            <div className="category-icon">🧪</div>

            <h3>Fertilizers</h3>

            <p>Give your crops the nutrients they need</p>

            <button>Explore</button>
          </div>

          <div
            className="category-card"
            onClick={() => {
              setSelectedCategory("Crop Protection");
              setBudgetOnly(false);
            }}
          >
            <div className="category-icon">🛡️</div>

            <h3>Crop Protection</h3>

            <p>Protect your crops from pests</p>

            <button>Explore</button>
          </div>

          <div
            className="category-card"
            onClick={() => {
              setSelectedCategory("Tools");
              setBudgetOnly(false);
            }}
          >
            <div className="category-icon">🛠️</div>

            <h3>Farm Tools</h3>

            <p>Useful tools for everyday farming</p>

            <button>Explore</button>
          </div>
        </div>
      </div>

      {/* Products */}

      <div className="products" id="products">
        <h2>Featured Products</h2>

        <p className="product-text">Quality farming products for your needs</p>

        {/* Filters */}

        <div className="filter-buttons">
          <button
            className={
              selectedCategory === "All" && !budgetOnly ? "active-filter" : ""
            }
            onClick={() => {
              setSelectedCategory("All");
              setBudgetOnly(false);
            }}
          >
            All
          </button>

          <button
            className={selectedCategory === "Seeds" ? "active-filter" : ""}
            onClick={() => {
              setSelectedCategory("Seeds");
              setBudgetOnly(false);
            }}
          >
            Seeds
          </button>

          <button
            className={
              selectedCategory === "Fertilizers" ? "active-filter" : ""
            }
            onClick={() => {
              setSelectedCategory("Fertilizers");
              setBudgetOnly(false);
            }}
          >
            Fertilizers
          </button>

          <button
            className={
              selectedCategory === "Crop Protection" ? "active-filter" : ""
            }
            onClick={() => {
              setSelectedCategory("Crop Protection");
              setBudgetOnly(false);
            }}
          >
            Crop Protection
          </button>

          <button
            className={selectedCategory === "Tools" ? "active-filter" : ""}
            onClick={() => {
              setSelectedCategory("Tools");
              setBudgetOnly(false);
            }}
          >
            Tools
          </button>

          <button
            className={budgetOnly ? "active-filter" : ""}
            onClick={() => {
              setBudgetOnly(true);
              setSelectedCategory("All");
            }}
          >
            Under ₹500
          </button>
        </div>

        {/* Product Grid */}

        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                className="product-card"
                key={product.id}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>

                <div className="product-actions">
                  <button
                    className="wishlist-button"
                    onClick={(event) => {
                      event.stopPropagation();

                      toggleWishlist(product);
                    }}
                  >
                    {isInWishlist(product.id) ? "❤️" : "♡"}
                  </button>

                  <button
                    className="compare-button"
                    onClick={(event) => {
                      event.stopPropagation();

                      toggleCompare(product);
                    }}
                  >
                    {isInCompare(product.id) ? "✓" : "⚖️"}
                  </button>
                </div>

                <h3>{product.name}</h3>

                <p>
                  {product.category} • {product.crop}
                </p>

                <p className="rating">⭐ {product.rating}</p>

                <h4>₹{product.price}</h4>

                <button
                  onClick={(event) => {
                    event.stopPropagation();

                    addToCart(product);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))
          ) : (
            <div className="no-products">
              <h3>No products found</h3>

              <p>Try another search or category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}

      {selectedProduct && (
        <div className="product-details-area">
          <button
            className="back-button"
            onClick={() => setSelectedProduct(null)}
          >
            ← Back to Products
          </button>

          <div className="product-details">
            <div className="product-details-image">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>

            <div className="product-details-info">
              <p className="details-category">{selectedProduct.category}</p>

              <h2>{selectedProduct.name}</h2>

              <p className="details-crop">Crop: {selectedProduct.crop}</p>

              <p className="details-rating">⭐ {selectedProduct.rating} / 5</p>

              <h3>₹{selectedProduct.price}</h3>

              <p className="details-description">
                {selectedProduct.description}
              </p>

              <button
                className="details-cart-button"
                onClick={() => addToCart(selectedProduct)}
              >
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist */}

      <div className="wishlist-area" id="wishlist">
        <h2>Your Wishlist ❤️</h2>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">♡</div>

            <h3>Your wishlist is empty</h3>

            <p>Save products here for later.</p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div className="wishlist-card" key={product.id}>
                <img src={product.image} alt={product.name} />

                <div className="wishlist-info">
                  <h3>{product.name}</h3>

                  <p>
                    {product.category} • {product.crop}
                  </p>

                  <strong>₹{product.price}</strong>

                  <div className="wishlist-actions">
                    <button onClick={() => addToCart(product)}>
                      🛒 Add to Cart
                    </button>

                    <button
                      className="wishlist-remove"
                      onClick={() => toggleWishlist(product)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compare */}

      <div className="compare-area" id="compare">
        <h2>Compare Products ⚖️</h2>

        {compareList.length === 0 ? (
          <div className="empty-compare">
            <div className="empty-compare-icon">⚖️</div>

            <h3>No products selected</h3>

            <p>Select products to compare their details.</p>
          </div>
        ) : (
          <div className="compare-table-container">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>

                  {compareList.map((product) => (
                    <th key={product.id}>{product.name}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Image</td>

                  {compareList.map((product) => (
                    <td key={product.id}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="compare-image"
                      />
                    </td>
                  ))}
                </tr>

                <tr>
                  <td>Category</td>

                  {compareList.map((product) => (
                    <td key={product.id}>{product.category}</td>
                  ))}
                </tr>

                <tr>
                  <td>Crop</td>

                  {compareList.map((product) => (
                    <td key={product.id}>{product.crop}</td>
                  ))}
                </tr>

                <tr>
                  <td>Price</td>

                  {compareList.map((product) => (
                    <td key={product.id}>
                      <strong>₹{product.price}</strong>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td>Rating</td>

                  {compareList.map((product) => (
                    <td key={product.id}>⭐ {product.rating}</td>
                  ))}
                </tr>

                <tr>
                  <td>Action</td>

                  {compareList.map((product) => (
                    <td key={product.id}>
                      <button
                        className="compare-remove"
                        onClick={() => toggleCompare(product)}
                      >
                        Remove
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cart */}

      <div className="cart-area" id="cart">
        <h2>Your Cart 🛒</h2>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>

            <h3>Your cart is empty</h3>

            <p>Add some farming products to your cart.</p>
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>

                    <p>
                      {item.category} • {item.crop}
                    </p>

                    <h4>₹{item.price}</h4>
                  </div>

                  <div className="quantity-controls">
                    <button onClick={() => decreaseQuantity(item.id)}>−</button>

                    <span>{item.quantity}</span>

                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                  </div>

                  <div className="cart-item-total">
                    <strong>₹{item.price * item.quantity}</strong>

                    <button
                      className="remove-button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Items</span>

                <span>
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              </div>

              <div className="summary-row total-row">
                <strong>Total</strong>

                <strong>₹{cartTotal}</strong>
              </div>

              <button
                className="checkout-button"
                onClick={() => {
                  setShowCheckout(true);

                  setTimeout(() => {
                    document.getElementById("checkout")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }, 100);
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout */}

      {showCheckout && (
        <div className="checkout-area" id="checkout">
          {!orderPlaced ? (
            <div className="checkout-container">
              <div className="checkout-form">
                <h2>Checkout 📦</h2>

                <p>Enter your delivery details.</p>

                <form onSubmit={placeOrder}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customer.name}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        name: event.target.value,
                      })
                    }
                    required
                  />

                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={customer.phone}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        phone: event.target.value,
                      })
                    }
                    required
                  />

                  <textarea
                    placeholder="Delivery Address"
                    value={customer.address}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        address: event.target.value,
                      })
                    }
                    required
                  />

                  <input
                    type="text"
                    placeholder="City"
                    value={customer.city}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        city: event.target.value,
                      })
                    }
                    required
                  />

                  <input
                    type="text"
                    placeholder="Pincode"
                    value={customer.pincode}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        pincode: event.target.value,
                      })
                    }
                    required
                  />
                  <div className="payment-method">
                    <h3>Payment Method</h3>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />

                      <div>
                        <strong>Cash on Delivery</strong>
                        <p>Pay when your order is delivered.</p>
                      </div>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />

                      <div>
                        <strong>Online Payment</strong>
                        <p>
                          Demo payment option. Gateway can be integrated later.
                        </p>
                      </div>
                    </label>
                  </div>
                  <button type="submit" className="place-order-button">
                    {paymentMethod === "cod"
                      ? "Place Order - Cash on Delivery"
                      : "Proceed to Online Payment"}
                  </button>
                </form>
              </div>

              <div className="checkout-summary">
                <h2>Order Summary</h2>

                {cart.map((item) => (
                  <div className="checkout-item" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div>
                      <h4>{item.name}</h4>

                      <p>
                        {item.quantity} × ₹{item.price}
                      </p>
                    </div>

                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                ))}

                <div className="checkout-total">
                  <span>Total</span>

                  <strong>₹{cartTotal}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="order-success">
              <div className="success-icon">✓</div>

              <h2>Order Placed Successfully!</h2>

              <p className="order-id">
                Order ID: <strong>{orderId}</strong>
              </p>

              <p>
                Payment Method:{" "}
                <strong>
                  {paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </strong>
              </p>

              <p>
                Thank you for shopping with <strong>FarmNeed</strong>!
              </p>

              <button
                className="continue-shopping-button"
                onClick={() => {
                  setOrderPlaced(false);
                  setShowCheckout(false);
                  setSelectedProduct(null);
                }}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      )}

      {/* Budget */}

      <div className="budget">
        <div>
          <p className="small-title">SMART FARMING</p>

          <h2>Quality Products Under ₹500</h2>

          <p>
            Get useful farming products without putting extra pressure on your
            budget.
          </p>

          <button
            className="shop-button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setBudgetOnly(true);

              setTimeout(() => {
                document.getElementById("products").scrollIntoView({
                  behavior: "smooth",
                });
              }, 100);
            }}
          >
            View Products
          </button>
        </div>

        <div className="budget-icon">💰🌱</div>
      </div>

      {/* Why */}

      <div className="why">
        <h2>Why Choose FarmNeed?</h2>

        <div className="why-grid">
          <div className="why-card">
            <div>💰</div>

            <h3>Affordable Prices</h3>

            <p>Farming products at farmer-friendly prices.</p>
          </div>

          <div className="why-card">
            <div>✅</div>

            <h3>Quality Products</h3>

            <p>Carefully selected products for your farm.</p>
          </div>

          <div className="why-card">
            <div>🚚</div>

            <h3>Easy Shopping</h3>

            <p>Simple and convenient online shopping.</p>
          </div>

          <div className="why-card">
            <div>🌱</div>

            <h3>Farmer Focused</h3>

            <p>Designed around the needs of farmers.</p>
          </div>
        </div>
      </div>

      <div className="orders-area" id="orders">
        <div className="orders-container">
          <h2>My Orders</h2>
          <p>View your previous FarmNeed orders</p>
          {orders.length > 0 && (
            <div className="clear-orders-area">
              <button
                className="clear-orders-button"
                onClick={() => {
                  setOrders([]);
                  localStorage.removeItem("farmneed-orders");
                }}
              >
                Clear Order History
              </button>
            </div>
          )}
          {orders.length === 0 ? (
            <div className="no-orders">
              <h3>No Orders Yet</h3>
              <p>Your completed orders will appear here.</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div className="order-card" key={order.id}>
                  <div className="order-top">
                    <div>
                      <h3>Order #{order.id}</h3>
                      <p>Order Date: {order.date}</p>
                    </div>

                    <strong className="order-status">
                      {order.status || "Confirmed"}
                    </strong>
                  </div>

                  <div className="order-tracking">
                    <div
                      className={
                        "tracking-step " +
                        (order.status === "Confirmed" ||
                        order.status === "Processing" ||
                        order.status === "Shipped" ||
                        order.status === "Delivered"
                          ? "active"
                          : "")
                      }
                    >
                      <div className="tracking-circle">1</div>
                      <p>Confirmed</p>
                    </div>

                    <div
                      className={
                        "tracking-step " +
                        (order.status === "Processing" ||
                        order.status === "Shipped" ||
                        order.status === "Delivered"
                          ? "active"
                          : "")
                      }
                    >
                      <div className="tracking-circle">2</div>
                      <p>Processing</p>
                    </div>

                    <div
                      className={
                        "tracking-step " +
                        (order.status === "Shipped" ||
                        order.status === "Delivered"
                          ? "active"
                          : "")
                      }
                    >
                      <div className="tracking-circle">3</div>
                      <p>Shipped</p>
                    </div>

                    <div
                      className={
                        "tracking-step " +
                        (order.status === "Delivered" ? "active" : "")
                      }
                    >
                      <div className="tracking-circle">4</div>
                      <p>Delivered</p>
                    </div>
                  </div>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div className="order-item" key={item.id}>
                        <img src={item.image} alt={item.name} />

                        <div>
                          <h4>{item.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                          <p>
                            ₹{item.price} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-bottom">
                    <div>
                      <span>
                        Payment:{" "}
                        <strong>
                          {order.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "Online Payment"}
                        </strong>
                      </span>

                      <br />

                      <strong>Total: ₹{order.total}</strong>
                    </div>

                    <button
                      className="cancel-order-button"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdmin && (
        <div className="admin-area" id="admin">
          <div className="admin-container">
            <div className="admin-heading">
              <div>
                <h2>Admin Dashboard</h2>
                <p>Manage FarmNeed products and orders</p>
              </div>

              <button
                className="admin-close-button"
                onClick={() => setShowAdmin(false)}
              >
                Back to Store
              </button>
            </div>

            <div className="admin-stats">
              <div className="admin-stat-card">
                <h3>Total Products</h3>
                <strong>{products.length}</strong>
              </div>

              <div className="admin-stat-card">
                <h3>Total Orders</h3>
                <strong>{orders.length}</strong>
              </div>

              <div className="admin-stat-card">
                <h3>Total Customers</h3>
                <strong>
                  {new Set(orders.map((order) => order.customer.phone)).size}
                </strong>
              </div>

              <div className="admin-stat-card">
                <h3>Total Sales</h3>
                <strong>
                  ₹{orders.reduce((total, order) => total + order.total, 0)}
                </strong>
              </div>
            </div>

            <div className="admin-orders">
              <h3>Manage Orders</h3>

              {orders.length === 0 ? (
                <p className="admin-empty">No orders available.</p>
              ) : (
                orders.map((order) => (
                  <div className="admin-order-card" key={order.id}>
                    <div>
                      <strong>Order #{order.id}</strong>

                      <p>Customer: {order.customer.name}</p>

                      <p>Total: ₹{order.total}</p>
                    </div>

                    <select
                      value={order.status || "Confirmed"}
                      onChange={(e) => {
                        const updatedOrders = orders.map((item) =>
                          item.id === order.id
                            ? {
                                ...item,
                                status: e.target.value,
                              }
                            : item,
                        );

                        setOrders(updatedOrders);

                        localStorage.setItem(
                          "farmneed-orders",
                          JSON.stringify(updatedOrders),
                        );
                      }}
                    >
                      <option value="Confirmed">Confirmed</option>

                      <option value="Processing">Processing</option>

                      <option value="Shipped">Shipped</option>

                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="admin-products">
        <h3>Manage Products</h3>

        <form className="add-product-form" onSubmit={addProduct}>
          <input
            type="text"
            placeholder="Product Name"
            value={adminProductName}
            onChange={(e) => setAdminProductName(e.target.value)}
          />

          <select
            value={adminProductCategory}
            onChange={(e) => setAdminProductCategory(e.target.value)}
          >
            <option value="Seeds">Seeds</option>
            <option value="Fertilizers">Fertilizers</option>
            <option value="Crop Protection">Crop Protection</option>
            <option value="Tools">Tools</option>
          </select>

          <select
            value={adminProductCrop}
            onChange={(e) => setAdminProductCrop(e.target.value)}
          >
            <option value="All">All Crops</option>
            <option value="Rice">Rice</option>
            <option value="Tomato">Tomato</option>
            <option value="Chilli">Chilli</option>
            <option value="Maize">Maize</option>
            <option value="Cotton">Cotton</option>
            <option value="Onion">Onion</option>
            <option value="Groundnut">Groundnut</option>
          </select>

          <input
            type="number"
            placeholder="Price"
            value={adminProductPrice}
            onChange={(e) => setAdminProductPrice(e.target.value)}
          />

          <button type="submit">Add Product</button>
        </form>

        <div className="admin-product-list">
          {products.map((product) => (
            <div className="admin-product-row" key={product.id}>
              <div>
                <strong>{product.name}</strong>

                <p>
                  {product.category} · {product.crop}
                </p>
              </div>

              <strong>₹{product.price}</strong>

              <button
                className="delete-product-button"
                onClick={() => deleteProduct(product.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom */}

      <div className="bottom-area">
        <h2>FarmNeed 🌱</h2>

        <p>Making farming product shopping simple and affordable.</p>

        <p>© 2026 FarmNeed. All rights reserved.</p>
      </div>
    </div>
  );
}

export default App;
