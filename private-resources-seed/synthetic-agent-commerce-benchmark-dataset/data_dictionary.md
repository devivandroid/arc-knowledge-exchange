# Data Dictionary

Every row represents one synthetic commerce event where an autonomous agent evaluates, purchases, or attempts to retrieve a digital knowledge resource.

| Field | Meaning |
| --- | --- |
| event_id | Stable row identifier. |
| timestamp | Synthetic event time in UTC. |
| agent_id | Pseudonymous synthetic agent identifier. |
| provider_id | Pseudonymous synthetic resource provider identifier. |
| resource_category | Marketplace category used for discovery and analytics. |
| resource_type | Asset format purchased or requested by the agent. |
| payment_amount_usdc | Listed purchase price paid or attempted. |
| payment_success | Whether the payment verification path succeeded. |
| retry_count | Number of retries before completion or failure. |
| execution_latency_ms | End-to-end latency from resource request to final state. |
| tool_used | Primary agent tool used in the workflow. |
| chain_name | Settlement network label used in the synthetic scenario. |
| gas_fee_usdc | Simulated USDC gas cost. |
| purchase_completed | Whether the purchase resulted in unlocked access. |
| satisfaction_score | Synthetic post-purchase quality score from 1.0 to 5.0. |
| workflow_reused | Whether the agent reused this resource in a later workflow. |
| payment_method | Payment path used by the agent. |
| model_family | Model family assigned to the synthetic agent workflow. |
| execution_cost_usdc | Estimated model/tool execution cost for the workflow. |
