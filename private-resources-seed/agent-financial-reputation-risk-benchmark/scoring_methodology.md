# Scoring Methodology

The scores in this package are synthetic and intended for benchmarking model behavior, not for judging real agents.

## Reputation score

The synthetic `reputation_score` is derived from:

- Payment success rate.
- Dispute frequency.
- Refund frequency.
- Activity history length.
- Provider and buyer diversity.
- Latency stability.

Higher values indicate a more reliable synthetic participant.

## Financial risk score

The synthetic `financial_risk_score` is derived from:

- Failed transaction rate.
- Dispute and refund density.
- High average order value with short activity history.
- High latency and retry profile.
- Low counterparty diversity.

Higher values indicate greater synthetic financial risk.

## Risk tiers

| Tier | Typical score band | Interpretation |
| --- | --- | --- |
| Low | 0-30 | Strong payment history and low dispute pattern. |
| Medium | 30-60 | Mixed performance or limited history. |
| High | 60-100 | Elevated failure, dispute, or refund behavior. |

These tiers are deliberately simple so teams can compare baseline models before implementing more complex scoring systems.
