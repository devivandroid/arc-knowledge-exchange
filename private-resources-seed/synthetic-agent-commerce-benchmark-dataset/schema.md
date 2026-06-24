# Schema

This synthetic benchmark package models autonomous AI agents purchasing and retrieving machine-readable knowledge assets. It is generated for research, simulation, and machine learning experiments. It does not contain real user activity, real production traffic, or official Arc ecosystem data.

Primary file: `agent_commerce_sample.csv`

| Column | Type | Example |
| --- | --- | --- |
| event_id | string | evt_0001 |
| timestamp | ISO-8601 datetime | 2026-05-01T09:02:11Z |
| agent_id | string | agt_research_014 |
| provider_id | string | prv_schema_002 |
| resource_category | string | API Monetization |
| resource_type | string | JSON Schema |
| payment_amount_usdc | decimal | 0.75 |
| payment_success | boolean | true |
| retry_count | integer | 0 |
| execution_latency_ms | integer | 1840 |
| tool_used | enum | resource_search |
| chain_name | string | Arc Testnet |
| gas_fee_usdc | decimal | 0.0021 |
| purchase_completed | boolean | true |
| satisfaction_score | decimal | 4.7 |
| workflow_reused | boolean | true |
| payment_method | enum | USDC_TRANSFER |
| model_family | string | gpt-4.1 |
| execution_cost_usdc | decimal | 0.018 |
