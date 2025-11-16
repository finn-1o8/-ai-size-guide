import type { HeadersFunction, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { useEffect } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  // Placeholder: accept form data for widget settings preview/save later.
  // For now, this endpoint is a no-op to validate the flow.
  const form = await request.formData();
  const message = `Saved settings: ${Array.from(form.keys()).join(", ")}`;
  return new Response(JSON.stringify({ ok: true, message }), {
    headers: { "Content-Type": "application/json" },
  });
};

export default function Settings() {
  const fetcher = useFetcher<typeof action>();
  const isSaving = ["loading", "submitting"].includes(fetcher.state);

  useEffect(() => {
    if (fetcher.data && (fetcher.data as any).ok) {
      // @ts-ignore App Bridge web component toast
      window?.shopify?.toast?.show?.("Settings saved");
    }
  }, [fetcher.data]);

  return (
    <s-page heading="AI Size Guide — Onboarding">
      <s-layout>
        <s-layout-section>
          <s-section heading="1) Widget style">
            <fetcher.Form method="post">
              <s-stack gap="base">
                <s-select label="Layout" name="layout">
                  <option value="modal">Modal</option>
                  <option value="drawer">Drawer</option>
                  <option value="inline">Inline</option>
                </s-select>
                <s-text-field label="Button text" name="ctaText" value="Find your size" />
                <s-text-field label="Primary color" name="primaryColor" value="#111827" />
                <s-text-field label="Accent color" name="accentColor" value="#10b981" />
                <s-button submit {...(isSaving ? { loading: true } : {})}>Save style</s-button>
              </s-stack>
            </fetcher.Form>
          </s-section>

          <s-section heading="2) Size charts">
            <s-paragraph>
              Create, edit and import size charts. Use the manager to add rows and measurements.
            </s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-link href="/app/settings/charts">
                <s-button>Open chart manager</s-button>
              </s-link>
            </s-stack>
          </s-section>

          <s-section heading="3) Assign to products">
            <s-paragraph>
              Assign charts by product, collection, or tag. Validation will highlight conflicts.
            </s-paragraph>
            <s-button disabled>Open assignments</s-button>
          </s-section>
        </s-layout-section>

        <s-layout-section secondary>
          <s-section heading="Preview">
            <s-paragraph>
              Live widget preview will render here as you change styles. Coming soon.
            </s-paragraph>
          </s-section>
        </s-layout-section>
      </s-layout>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};


