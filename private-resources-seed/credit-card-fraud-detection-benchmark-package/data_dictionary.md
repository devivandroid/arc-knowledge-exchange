# Data Dictionary

This package contains a small synthetic/anonymized benchmark starter sample for fraud detection workflow testing. It does not include the full public credit-card transaction dataset.

| Field | Type | Description |
| --- | --- | --- |
| Time | number | Elapsed seconds from the first transaction in the sample window. |
| V1-V28 | number | PCA-style anonymized numeric features. The original source variables are not exposed. |
| Amount | number | Transaction amount in the sample currency unit. |
| Class | integer | Target label: `0` means normal transaction, `1` means fraud/anomaly. |

## Usage notes

- Treat `Class` as highly imbalanced in real-world modeling.
- Do not infer feature meaning from V1-V28 names; they are intentionally anonymized.
- This sample is intended for pipeline validation, model smoke tests, schema checks, and metric examples.
