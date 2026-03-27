---
name: PayMob Integration
description: Instructions for securely interacting with PayMob APIs, handling HMAC-SHA512 verification, and processing EGP transactions.
---

# PayMob Integration Guidelines

1. **Authentication**: Always obtain an authentication token first using API keys.
2. **Order Registration**: Create an order using the auth token and reservation details.
3. **Payment Key Generation**: Obtain the payment key using the order ID and billing data.
4. **Webhook Security**: 
   - The webhook callback from PayMob MUST be verified using HMAC-SHA512.
   - Concatenate specific fields from the payload exactly as specified in PayMob documentation.
   - Hash with HMAC-SHA512 using the Merchant HMAC key.
   - Compare the output with the `hmac` query parameter attached to the request.
5. **Idempotency**: Ensure multiple webhooks for the same order do not result in double processing. Always check the database for current transaction status before modifying it based on incoming webhooks.
