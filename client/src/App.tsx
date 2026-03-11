import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

function CounterPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ count: number }>({
    queryKey: ["/api/counter"],
    queryFn: () => fetch("/api/counter").then((r) => r.json()),
  });

  const increment = useMutation({
    mutationFn: () =>
      fetch("/api/counter/increment", { method: "POST" }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/counter"] }),
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold">Counter</h1>
      <p className="text-6xl font-mono">
        {isLoading ? "…" : data?.count ?? 0}
      </p>
      <Button
        onClick={() => increment.mutate()}
        disabled={increment.isPending}
        size="lg"
      >
        Increment
      </Button>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CounterPage />
    </QueryClientProvider>
  );
}
