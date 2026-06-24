from pathlib import Path

import pandas as pd


DATA_PATH = Path(__file__).with_name("agent_risk_scores.csv")


def classify(score: float) -> str:
    if score >= 60:
        return "High"
    if score >= 30:
        return "Medium"
    return "Low"


def main() -> None:
    df = pd.read_csv(DATA_PATH)
    df["baseline_risk_score"] = (
        (1 - df["payment_success_rate"]) * 45
        + (df["disputed_transactions"] / df["total_transactions"]) * 220
        + (df["refunded_transactions"] / df["total_transactions"]) * 120
        + (df["failed_transactions"] / df["total_transactions"]) * 80
        + (df["average_latency_ms"] / df["average_latency_ms"].max()) * 15
    ).clip(0, 100)
    df["baseline_risk_tier"] = df["baseline_risk_score"].apply(classify)

    accuracy = (df["baseline_risk_tier"] == df["risk_tier"]).mean()
    print(f"Rows: {len(df)}")
    print(f"Baseline tier agreement: {accuracy:.2%}")
    print("\nTier counts:")
    print(df["baseline_risk_tier"].value_counts())


if __name__ == "__main__":
    main()
