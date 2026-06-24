from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split


DATA_PATH = Path(__file__).with_name("creditcard_sample.csv")


def main() -> None:
    df = pd.read_csv(DATA_PATH)
    X = df.drop(columns=["Class"])
    y = df["Class"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.3,
        random_state=42,
        stratify=y,
    )

    print("Rows:", len(df))
    print("Train rows:", len(X_train))
    print("Test rows:", len(X_test))
    print("Fraud rate:", round(float(y.mean()), 4))


if __name__ == "__main__":
    main()
