# Schema

This synthetic benchmark package supports evaluation of financial reputation and risk scoring models for autonomous AI agents. It is generated for research, simulation, and machine learning workflows. It does not contain real user activity or production marketplace data.

Primary file: `agent_risk_scores.csv`

| Column | Type | Description |
| --- | --- | --- |
| agent_id | string | Synthetic agent identifier. |
| total_transactions | integer | Total observed synthetic payment events. |
| successful_transactions | integer | Completed payment events. |
| failed_transactions | integer | Failed or abandoned payment attempts. |
| disputed_transactions | integer | Synthetic disputed purchases. |
| refunded_transactions | integer | Synthetic refunded transactions. |
| average_order_value_usdc | decimal | Average transaction value. |
| total_volume_usdc | decimal | Aggregate synthetic purchase volume. |
| average_gas_fee_usdc | decimal | Average simulated gas fee paid in USDC. |
| average_latency_ms | integer | Average payment-to-access workflow latency. |
| days_active | integer | Synthetic activity window. |
| unique_providers | integer | Number of providers interacted with. |
| unique_buyers | integer | Number of buyers or counterparties served. |
| payment_success_rate | decimal | Successful transactions divided by total transactions. |
| reputation_score | decimal | Higher is better; 0 to 100. |
| financial_risk_score | decimal | Higher is riskier; 0 to 100. |
| risk_tier | enum | Low, Medium, or High. |
