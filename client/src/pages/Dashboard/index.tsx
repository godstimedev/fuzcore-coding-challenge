import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: "—" },
          { label: "Total Expenses", value: "—" },
          { label: "Outstanding Invoices", value: "—" },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-neutral-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <LayoutDashboard className="w-10 h-10 text-neutral-300" />
          <p className="text-neutral-500 text-sm">
            Your financial summary will appear here once you have transactions and invoices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
