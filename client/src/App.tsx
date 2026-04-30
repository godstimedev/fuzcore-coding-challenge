import { Switch, Route, Redirect } from "wouter";
import { APP_ROUTES } from "@/constants/routes";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import DashboardPage from "@/pages/Dashboard";
import CustomersPage from "@/pages/Customers";
import TransactionsPage from "@/pages/Transactions";

export default function App() {
  return (
    <Switch>
      <Route path={APP_ROUTES.LOGIN} component={LoginPage} />
      <Route path={APP_ROUTES.SIGNUP} component={SignupPage} />
      <Route path={APP_ROUTES.HOME}>
        <Redirect to={APP_ROUTES.DASHBOARD} />
      </Route>
      <Route>
        <ProtectedRoute>
          <AppShell>
            <Switch>
              <Route path={APP_ROUTES.DASHBOARD} component={DashboardPage} />
              <Route path={APP_ROUTES.CUSTOMERS} component={CustomersPage} />
              <Route path={APP_ROUTES.TRANSACTIONS} component={TransactionsPage} />
              <Route>
                <div className="text-center py-20 text-neutral-500">Page not found</div>
              </Route>
            </Switch>
          </AppShell>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}
