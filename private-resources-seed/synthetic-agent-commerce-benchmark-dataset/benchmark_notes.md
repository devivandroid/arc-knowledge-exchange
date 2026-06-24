# Benchmark Notes

This is a synthetic benchmark package for experimentation. It is useful for evaluating marketplace analytics, agent payment orchestration, recommendation models, and reinforcement-learning style policy simulations.

## Suggested tasks

- Predict `purchase_completed` from price, retries, latency, resource category, and tool path.
- Estimate expected satisfaction score by category and resource type.
- Compare recommendation strategies using `workflow_reused` as a proxy for downstream value.
- Simulate payment retry policies using `payment_success`, `retry_count`, and `gas_fee_usdc`.
- Segment agent behavior by `model_family` and `tool_used`.

## Important limitations

- No row represents a real user, customer, or production agent.
- The dataset is intentionally small for MVP delivery and pipeline validation.
- Pricing, latency, gas, and satisfaction values are plausible synthetic values, not empirical measurements.
- Do not use this package to claim real market performance.
