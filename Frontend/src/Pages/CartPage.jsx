import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Trash2, Plus, Minus } from "lucide-react";
import { mapProductFromApi } from "../utils/product-mapper";
import { useSelector, useDispatch } from "react-redux";
import {
  removeItemFromCart,
  addItemToCart,
} from "../state/userSlice/userSlice";

const EmptyCart = () => (
  <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8 text-center">
    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Votre sac est vide
    </h1>
    <p className="mt-4 text-lg text-gray-500">
      On dirait que vous n’avez encore rien ajouté à votre sac.
    </p>
    <Link
      to="/"
      className="mt-8 inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Continuer vos achats
    </Link>
  </div>
);

const LoadingCart = () => (
  <div className="text-center py-20 flex flex-col items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
    <h1 className="text-2xl font-bold mt-4">Chargement de votre sac...</h1>
  </div>
);

const CartItem = ({
  item,
  handleRemoveItem,
  handleQuantityChange,
  cartLoading,
}) => {
  const product = mapProductFromApi(item.product);

  return (
    <li className="flex py-6 sm:py-10">
      <div className="flex-shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
          loading="lazy"
        />
      </div>
      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
          <div>
            <div className="flex justify-between">
              <h3 className="text-sm">
                <Link
                  to={`/product/${product.id}`}
                  className="font-medium text-gray-700 hover:text-gray-800"
                >
                  {product.name}
                </Link>
              </h3>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {product.brand}
            </p>

            <div className="mt-2 flex items-center">
              <p className="text-sm text-gray-500 mr-4">Qté:</p>
              <div className="flex items-center border rounded">
                <button
                  onClick={() => handleQuantityChange(product.id, -1)}
                  disabled={cartLoading || item.qty <= 1}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="px-3 py-1 text-center font-medium w-12">
                  {item.qty}
                </span>
                <button
                  onClick={() => handleQuantityChange(product.id, 1)}
                  disabled={cartLoading}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:pr-9">
            <p className="text-right text-base font-semibold text-gray-900">
              €{Number(item.total).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end text-sm">
          <button
            type="button"
            onClick={() => handleRemoveItem(item.id)}
            disabled={cartLoading}
            className="flex items-center font-medium text-red-600 hover:text-red-500 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            <span> Supprimer</span>
          </button>
        </div>
      </div>
    </li>
  );
};

const OrderSummary = ({ subtotal, shippingFee, total, onCheckout }) => (
  <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
    <h2 className="text-lg font-medium text-gray-900">Résumé de la commande</h2>
    <dl className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <dt className="text-sm text-gray-600"> Sous-total</dt>
        <dd className="text-sm font-medium text-gray-900">
          €{subtotal.toFixed(2)}
        </dd>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <dt className="flex items-center text-sm text-gray-600">
          <span>Frais de livraison estimés</span>
        </dt>
        <dd className="text-sm font-medium text-gray-900">
          €{shippingFee.toFixed(2)}
        </dd>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <dt className="text-base font-medium text-gray-900">
          {" "}
          Total de la commandel
        </dt>
        <dd className="text-base font-medium text-gray-900">
          €{total.toFixed(2)}
        </dd>
      </div>
    </dl>
    <div className="mt-6">
      <button
        type="button"
        onClick={onCheckout}
        className="rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-white hover:bg-white hover:border hover:border-primary hover:text-primary focus:outline-none  transition-colors duration-500 w-full"
      >
        Passer à la caisse
      </button>
    </div>
  </section>
);

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, cartLoading } = useSelector((state) => state.user);

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.total), 0);
  const shippingFee = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shippingFee;

  const handleRemoveItem = (itemId) => {
    dispatch(removeItemFromCart(itemId));
  };
  const handleQuantityChange = (productId, change) => {
    dispatch(addItemToCart({ product_id: productId, qty: change }));
  };

  
  if (cartLoading && cartItems.length === 0) {
    return <LoadingCart />;
  }

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }
  
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Sac de courses
        </h1>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Articles dans votre panier
            </h2>
            <ul
              role="list"
              className="divide-y divide-gray-200 border-t border-b border-gray-200"
            >
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  handleRemoveItem={handleRemoveItem}
                  handleQuantityChange={handleQuantityChange}
                  cartLoading={cartLoading}
                />
              ))}
            </ul>
          </section>

          <OrderSummary
            subtotal={subtotal}
            shippingFee={shippingFee}
            total={total}
            onCheckout={() => navigate("/shipping-details")}
          />
        </div>
      </div>
    </div>
  );
};
export default CartPage;
