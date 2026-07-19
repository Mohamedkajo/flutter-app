import { Switch, Route, Redirect } from "wouter";
import { CustomerLayout } from "@/layouts/CustomerLayout";
import { MerchantLayout } from "@/layouts/MerchantLayout";
import { DriverLayout } from "@/layouts/DriverLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";

// Customer Pages
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import StoreListing from "@/pages/StoreListing";
import Categories from "@/pages/Categories";
import StoreDetail from "@/pages/StoreDetail";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import LiveTracking from "@/pages/LiveTracking";
import Wallet from "@/pages/Wallet";
import Favorites from "@/pages/Favorites";
import Coupons from "@/pages/Coupons";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Addresses from "@/pages/Addresses";
import FlashSales from "@/pages/FlashSales";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Merchant Pages
import MerchantDashboard from "@/pages/merchant/Dashboard";
import MerchantOrders from "@/pages/merchant/Orders";
import MerchantProducts from "@/pages/merchant/Products";
import StoreSettings from "@/pages/merchant/StoreSettings";

// Driver Pages
import DriverDashboard from "@/pages/driver/Dashboard";
import ActiveOrders from "@/pages/driver/ActiveOrders";
import Earnings from "@/pages/driver/Earnings";
import DriverProfile from "@/pages/driver/Profile";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import NotFound from "@/pages/not-found";

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }: any) => {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return <Component {...rest} />;
};

export default function Routes() {
  const { user } = useAuth();

  // If user is logged in but hits root, maybe redirect them to their dashboard
  // Otherwise, default customer view
  const renderHome = () => {
    if (user?.role === 'admin') return <Redirect to="/admin" />;
    if (user?.role === 'merchant') return <Redirect to="/merchant" />;
    if (user?.role === 'driver') return <Redirect to="/driver" />;
    return <Home />;
  };

  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Admin Routes */}
      <Route path="/admin*">
        <AdminLayout>
          <Switch>
            <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} allowedRoles={['admin']} />} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>

      {/* Merchant Routes */}
      <Route path="/merchant*">
        <MerchantLayout>
          <Switch>
            <Route path="/merchant" component={() => <ProtectedRoute component={MerchantDashboard} allowedRoles={['merchant']} />} />
            <Route path="/merchant/orders" component={() => <ProtectedRoute component={MerchantOrders} allowedRoles={['merchant']} />} />
            <Route path="/merchant/products" component={() => <ProtectedRoute component={MerchantProducts} allowedRoles={['merchant']} />} />
            <Route path="/merchant/store" component={() => <ProtectedRoute component={StoreSettings} allowedRoles={['merchant']} />} />
            <Route component={NotFound} />
          </Switch>
        </MerchantLayout>
      </Route>

      {/* Driver Routes */}
      <Route path="/driver*">
        <DriverLayout>
          <Switch>
            <Route path="/driver" component={() => <ProtectedRoute component={DriverDashboard} allowedRoles={['driver']} />} />
            <Route path="/driver/orders" component={() => <ProtectedRoute component={ActiveOrders} allowedRoles={['driver']} />} />
            <Route path="/driver/earnings" component={() => <ProtectedRoute component={Earnings} allowedRoles={['driver']} />} />
            <Route path="/driver/profile" component={() => <ProtectedRoute component={DriverProfile} allowedRoles={['driver']} />} />
            <Route component={NotFound} />
          </Switch>
        </DriverLayout>
      </Route>

      {/* Customer Routes (Default) */}
      <Route>
        <CustomerLayout>
          <Switch>
            <Route path="/" component={renderHome} />
            <Route path="/search" component={Search} />
            <Route path="/stores" component={StoreListing} />
            <Route path="/categories" component={Categories} />
            <Route path="/stores/:storeId" component={StoreDetail} />
            <Route path="/products/:productId" component={ProductDetail} />
            <Route path="/cart" component={() => <ProtectedRoute component={Cart} allowedRoles={['customer', 'admin']} />} />
            <Route path="/checkout" component={() => <ProtectedRoute component={Checkout} allowedRoles={['customer', 'admin']} />} />
            <Route path="/orders" component={() => <ProtectedRoute component={Orders} allowedRoles={['customer', 'admin']} />} />
            <Route path="/orders/:orderId" component={() => <ProtectedRoute component={OrderDetail} allowedRoles={['customer', 'admin']} />} />
            <Route path="/orders/:orderId/track" component={() => <ProtectedRoute component={LiveTracking} allowedRoles={['customer', 'admin']} />} />
            <Route path="/wallet" component={() => <ProtectedRoute component={Wallet} allowedRoles={['customer', 'admin']} />} />
            <Route path="/favorites" component={() => <ProtectedRoute component={Favorites} allowedRoles={['customer', 'admin']} />} />
            <Route path="/coupons" component={() => <ProtectedRoute component={Coupons} allowedRoles={['customer', 'admin']} />} />
            <Route path="/notifications" component={() => <ProtectedRoute component={Notifications} allowedRoles={['customer', 'admin']} />} />
            <Route path="/profile" component={() => <ProtectedRoute component={Profile} allowedRoles={['customer', 'admin']} />} />
            <Route path="/addresses" component={() => <ProtectedRoute component={Addresses} allowedRoles={['customer', 'admin']} />} />
            <Route path="/flash-sales" component={FlashSales} />
            
            <Route component={NotFound} />
          </Switch>
        </CustomerLayout>
      </Route>
    </Switch>
  );
}
