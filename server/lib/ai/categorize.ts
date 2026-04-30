import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

interface CategoryOption {
  id: string;
  name: string;
  type: "income" | "expense";
}

export interface CategorizeResult {
  categoryId: string | null;
  confidence: "high" | "medium" | "low";
  suggestedName?: string;
}

export async function categorizeTransaction(
  description: string,
  transactionType: "income" | "expense",
  categories: CategoryOption[],
): Promise<CategorizeResult> {
  const filtered = categories.filter((c) => c.type === transactionType);

  const categoryList =
    filtered.length === 0
      ? "None available"
      : filtered.map((c) => `- ID: ${c.id}, Name: ${c.name}`).join("\n");

  const prompt = `You are a financial transaction categorizer. Given a transaction description and a list of available categories, identify the best matching category.

Transaction description: "${description}"
Transaction type: ${transactionType}

Available categories:
${categoryList}

Respond with a JSON object only (no markdown, no explanation):
{
  "categoryId": "<the exact category ID from the list above, or null if none match well>",
  "confidence": "<high|medium|low>",
  "suggestedName": "<optional: a concise new category name to create if categoryId is null>"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(json) as CategorizeResult;

  return {
    categoryId: filtered.some((c) => c.id === parsed.categoryId) ? parsed.categoryId : null,
    confidence: parsed.confidence ?? "low",
    suggestedName: parsed.suggestedName,
  };
}
