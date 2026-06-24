# Feature Overview

The sample uses the common fraud-detection convention of anonymized PCA-style features named `V1` through `V28`.

## Intended ML usage

- Validate CSV ingestion and schema checks.
- Test preprocessing code that expects numeric transaction features.
- Run train/test split examples without downloading a large dataset.
- Demonstrate fraud metrics under class imbalance.

## Important limitation

The included rows are synthetic/anonymized starter rows. They are not a substitute for a full benchmark dataset and should not be used to claim production fraud detection performance.

## Recommended preprocessing

1. Confirm all feature columns are numeric.
2. Keep `Class` out of the feature matrix.
3. Scale `Amount` if the chosen model is sensitive to feature magnitude.
4. Use stratified splitting when possible because fraud labels are rare.
