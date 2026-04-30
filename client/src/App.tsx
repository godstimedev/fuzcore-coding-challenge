import { Switch, Route, Redirect } from "wouter";
import { APP_ROUTES } from "@/constants/routes";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/PublicOnlyRoute";
import { AppShell } from "@/components/layout/AppShell";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import DashboardPage from "@/pages/Dashboard";
import CustomersPage from "@/pages/Customers";
import TransactionsPage from "@/pages/Transactions";
import CategoriesPage from "@/pages/Categories";
import InvoicesPage from "@/pages/Invoices";
import InvoiceFormPage from "@/pages/Invoices/InvoiceForm";
import InvoiceDetailPage from "@/pages/Invoices/InvoiceDetail";

export default function App() {
  return (
    <Switch>
      <Route path={APP_ROUTES.LOGIN}>
        <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
      </Route>
      <Route path={APP_ROUTES.SIGNUP}>
        <PublicOnlyRoute><SignupPage /></PublicOnlyRoute>
      </Route>
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
              <Route path={APP_ROUTES.CATEGORIES} component={CategoriesPage} />
              {/* Invoice routes — specific paths before the :id wildcard */}
              <Route path={APP_ROUTES.INVOICES_NEW}>
                <InvoiceFormPage />
              </Route>
              <Route path="/invoices/:id/edit">
                {(params: { id: string }) => <InvoiceFormPage id={params.id} />}
              </Route>
              <Route path="/invoices/:id">
                {(params: { id: string }) => <InvoiceDetailPage id={params.id} />}
              </Route>
              <Route path={APP_ROUTES.INVOICES} component={InvoicesPage} />
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
