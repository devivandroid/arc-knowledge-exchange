from pathlib import Path

import pandas as pd


DATA_PATH = Path(__file__).with_name("agent_commerce_sample.csv")


def main() -> None:
    df = pd.read_csv(DATA_PATH)
    completion_rate = df["purchase_completed"].mean()
    avg_payment = df["payment_amount_usdc"].mean()
    category_summary = (
        df.groupby("resource_category")
        .agg(
            events=("event_id", "count"),
            completion_rate=("purchase_completed", "mean"),
            avg_satisfaction=("satisfaction_score", "mean"),
            avg_payment_usdc=("payment_amount_usdc", "mean"),
        )
        .sort_values("events", ascending=False)
    )

    print(f"Rows: {len(df)}")
    print(f"Completion rate: {completion_rate:.2%}")
    print(f"Average payment: {avg_payment:.2f} USDC")
    print("\nCategory summary:")
    print(category_summary.round(3))


if __name__ == "__main__":
    main()
