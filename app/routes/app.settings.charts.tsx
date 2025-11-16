import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";

type LoaderData = {
  charts: Array<{ id: string; name: string; unit: string; rows: number }>;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const charts = await db.sizeChart.findMany({
    orderBy: { updatedAt: "desc" },
    include: { rows: true },
  });
  const data: LoaderData = {
    charts: charts.map((c) => ({
      id: c.id,
      name: c.name,
      unit: c.unit,
      rows: c.rows.length,
    })),
  };
  return data;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  admin; // reserved for future use (e.g., product type hints)
  const form = await request.formData();
  const intent = String(form.get("intent") || "");

  if (intent === "create") {
    const name = String(form.get("name") || "New chart");
    const unit = String(form.get("unit") || "cm");
    const chart = await db.sizeChart.create({
      data: {
        name,
        unit,
        rows: [],
      },
    });
    return new Response(JSON.stringify({ ok: true, id: chart.id }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (intent === "delete") {
    const id = String(form.get("id") || "");
    if (id) {
      await db.sizeChart.delete({ where: { id } });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: false, error: "Unknown intent" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
};

export default function ChartsManager() {
  const { charts } = useLoaderData() as LoaderData;
  const createFetcher = useFetcher<typeof action>();
  const deleteFetcher = useFetcher<typeof action>();

  return (
    <s-page heading="Size charts">
      <s-layout>
        <s-layout-section>
          <s-section heading="Create a chart">
            <createFetcher.Form method="post">
              <input type="hidden" name="intent" value="create" />
              <s-stack direction="inline" gap="base">
                <s-text-field name="name" label="Chart name" value="Men’s Tops" />
                <s-select name="unit" label="Unit">
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </s-select>
                <s-button submit {...(createFetcher.state !== "idle" ? { loading: true } : {})}>
                  Create
                </s-button>
              </s-stack>
            </createFetcher.Form>
          </s-section>

          <s-section heading="Existing charts">
            {charts.length === 0 ? (
              <s-empty-state
                heading="No charts yet"
                action={{ content: "Create your first chart" }}
              >
                <s-paragraph>Use the form above to add your first chart.</s-paragraph>
              </s-empty-state>
            ) : (
              <s-resource-list
                items={charts}
                renderItem={(item: LoaderData["charts"][number]) => (
                  <s-resource-item id={item.id} accessibilityLabel={item.name}>
                    <s-stack direction="inline" align="space-between" blockAlign="center" gap="base">
                      <s-text as="h3" variant="headingSm">{item.name}</s-text>
                      <s-text color="subdued">{item.unit} · {item.rows} rows</s-text>
                      <deleteFetcher.Form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={item.id} />
                        <s-button variant="tertiary" tone="critical" submit>
                          Delete
                        </s-button>
                      </deleteFetcher.Form>
                    </s-stack>
                  </s-resource-item>
                )}
              />
            )}
          </s-section>
        </s-layout-section>
      </s-layout>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};


