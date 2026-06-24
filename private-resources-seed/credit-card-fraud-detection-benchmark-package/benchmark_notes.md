# Benchmark Notes

This starter package is designed for pipeline and metric validation, not for claims about production model quality.

## Recommended metrics

- ROC AUC
- PR AUC
- Precision
- Recall
- F1
- Confusion matrix

## Class imbalance

Fraud detection problems are usually highly imbalanced. Accuracy can look strong even when the model misses most fraud cases. Prefer PR AUC, recall at fixed precision, and confusion-matrix review.

## Full dataset acquisition

When using a public benchmark dataset, follow the original dataset license and download terms. This package includes curated sample files and starter assets only.
