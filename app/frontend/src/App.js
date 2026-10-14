import "@/App.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider } from "@/context/Store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SmoothScroll from "@/components/SmoothScroll";
import Home from "@/pages/Home";
import Listing from "@/pages/Listing";
import Categories from "@/pages/Categories";
import ProductDetail from "@/pages/ProductDetail";
import TryOn from "@/pages/TryOn";
import Scanner from "@/pages/Scanner";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import TrackOrder from "@/pages/TrackOrder";
import Wishlist from "@/pages/Wishlist";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmed from "@/pages/OrderConfirmed";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import AdminLayout from "@/components/AdminLayout";

const Layout = () => (
  <>
    <SmoothScroll />
    <Header />
    <main className="min-h-[60vh]"><Outlet /></main>
    <Footer />
    <CartDrawer />
  </>
);

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Listing />} />
            <Route path="/collections/:slug" element={<Listing />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/try-on" element={<TryOn />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:number" element={<OrderConfirmed />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<Listing />} />
          </Route>
          <Route element={<AdminLayout />}><Route path="/admin" element={<Admin />} /></Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-center" toastOptions={{ style: { background: "#180B0E", color: "#EADBB9", border: "1px solid rgba(197,160,89,0.4)", borderRadius: 0 } }} />
    </StoreProvider>
  );
}

export default App;
