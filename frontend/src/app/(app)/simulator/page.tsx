"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCalculateSimulation } from "@/features/app/simulator/mutations";
import { useCustomers, usePriceCoefficients } from "@/features/app/simulator/queries";
import type { CalculationRequest } from "@/features/app/simulator/types";

const defaultForm: CalculationRequest = {
  customer_id: 1,
  calculation_date: "2026-09-30",
  organization_type: "broadcast",
  broadcast_frequency: "weekly",
  user_count: 120,
  note: "月次見積もり",
};

export default function SimulatorPage() {
  const queryClient = useQueryClient();
  const customersQuery = useCustomers(true);
  const priceCoefficientsQuery = usePriceCoefficients(true);
  const calculateMutation = useCalculateSimulation();

  const [form, setForm] = useState<CalculationRequest>(defaultForm);

  const coefficientOptions = useMemo(
    () => priceCoefficientsQuery.data?.items ?? [],
    [priceCoefficientsQuery.data],
  );

  const customerOptions = useMemo(() => customersQuery.data?.items ?? [], [customersQuery.data]);
  const selectedCustomerId = customerOptions.some((customer) => customer.id === form.customer_id)
    ? form.customer_id
    : customerOptions[0]?.id ?? form.customer_id;

  const matchingCoefficient = coefficientOptions.find(
    (coefficient) =>
      coefficient.target_type === form.organization_type &&
      coefficient.is_active,
  );

  const handleChange = (
    field: keyof CalculationRequest,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    await calculateMutation.mutateAsync(form);
    await queryClient.invalidateQueries({ queryKey: ["app", "simulator", "scenarios"] });
  };

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <p className="text-sm font-medium text-primary">シミュレーション</p>
        <h1 className="mt-2 text-2xl font-semibold text-text">料金計算</h1>
        <p className="mt-2 text-sm text-text-muted">
          計算日と適用対象の係数を基に、使用者数から見積もり額を算出します。
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm text-text">
              顧客ID
              <select
                className="rounded-md border border-border bg-background px-3 py-2"
                value={selectedCustomerId}
                onChange={(event) => handleChange("customer_id", Number(event.target.value))}
              >
                {customerOptions.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    #{customer.id} / {customer.customer_name}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-text-muted">
              登録顧客数: {customerOptions.length}
            </p>

            <label className="grid gap-2 text-sm text-text">
              計算日
              <input
                type="date"
                className="rounded-md border border-border bg-background px-3 py-2"
                value={form.calculation_date}
                onChange={(event) => handleChange("calculation_date", event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm text-text">
              団体区分
              <input
                className="rounded-md border border-border bg-background px-3 py-2"
                value={form.organization_type}
                onChange={(event) => handleChange("organization_type", event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm text-text">
              放送頻度
              <input
                className="rounded-md border border-border bg-background px-3 py-2"
                value={form.broadcast_frequency}
                onChange={(event) => handleChange("broadcast_frequency", event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm text-text">
              使用者数
              <input
                type="number"
                min={1}
                className="rounded-md border border-border bg-background px-3 py-2"
                value={form.user_count}
                onChange={(event) => handleChange("user_count", Number(event.target.value))}
              />
            </label>

            <label className="grid gap-2 text-sm text-text">
              備考
              <textarea
                className="min-h-24 rounded-md border border-border bg-background px-3 py-2"
                value={form.note ?? ""}
                onChange={(event) => handleChange("note", event.target.value)}
              />
            </label>

            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleSubmit()}
              disabled={calculateMutation.isPending}
            >
              {calculateMutation.isPending ? "計算中..." : "見積もりを計算"}
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text">適用係数</h2>
          <div className="mt-4 space-y-3 text-sm text-text-muted">
            {matchingCoefficient ? (
              <>
                <p>係数名: {matchingCoefficient.name}</p>
                <p>単価: {matchingCoefficient.unit_price}</p>
                <p>適用期間: {matchingCoefficient.valid_from} ～ {matchingCoefficient.valid_to ?? "無期限"}</p>
              </>
            ) : (
              <p>対象の係数が見つかりませんでした。</p>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-base font-semibold text-text">結果</h3>
            {calculateMutation.data ? (
              <dl className="mt-3 space-y-2 text-sm text-text-muted">
                <div className="flex justify-between gap-3">
                  <dt>顧客</dt>
                  <dd>{calculateMutation.data.customer}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>総額</dt>
                  <dd>{calculateMutation.data.total_cost}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>計算日</dt>
                  <dd>{calculateMutation.data.calculation_date}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-text-muted">まだ計算結果はありません。</p>
            )}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text">顧客一覧</h2>
          <ul className="mt-4 space-y-2 text-sm text-text-muted">
            {customersQuery.isLoading ? (
              <li>顧客データを読み込み中です...</li>
            ) : customersQuery.isError ? (
              <li>顧客データを取得できませんでした。</li>
            ) : customerOptions.length ? (
              customerOptions.map((customer) => (
                <li key={customer.id} className="rounded-md border border-border bg-background p-3">
                  #{customer.id} / {customer.customer_name} / {customer.organization_type}
                </li>
              ))
            ) : (
              <li>顧客データがありません。</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text">係数一覧</h2>
          <ul className="mt-4 space-y-2 text-sm text-text-muted">
            {priceCoefficientsQuery.isLoading ? (
              <li>係数データを読み込み中です...</li>
            ) : priceCoefficientsQuery.isError ? (
              <li>係数データを取得できませんでした。</li>
            ) : coefficientOptions.length ? (
              coefficientOptions.map((coefficient) => (
                <li key={coefficient.id} className="rounded-md border border-border bg-background p-3">
                  #{coefficient.id} / {coefficient.name} / {coefficient.unit_price} / {coefficient.valid_from}
                  {coefficient.valid_to ? ` ～ ${coefficient.valid_to}` : " ～ 無期限"}
                </li>
              ))
            ) : (
              <li>係数データがありません。</li>
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
