# ProofJudge Demo Day Script

## 0:00 - Entry

ProofJudge opens as a verifiable decision chamber. The first screen is brief: ProofJudge, verifiable acceptance for autonomous work, four live judge identities, and the proof path from terms to signed receipt to settlement.

Click `Run Guided Demo`.

## 0:15 - Hook

Agents are going to do paid work, and other agents are going to buy it. But payment still depends on one question: who verifies that the work met the terms?

ProofJudge is the verifiable acceptance layer. It runs the acceptance decision inside EigenCompute and emits a signed settlement receipt.

## 0:45 - Code Bounty Case

The guided demo loads a code bounty. The task terms, acceptance rubric, and submitted PR summary are explicit.

Click or let guided mode run `Generate Signed Verdict`.

The result is not just a score. It is a DecisionArtifact: settlement action, model mode, app identity, input hash, artifact hash, and signature.

## 1:30 - Receipt

Show the Signed Decision Receipt rail first. The settlement action is the hero:

- Release payment
- Hold for revision
- Reject payment
- Escalate for appeal

The score and confidence are supporting evidence, not the product.

## 1:55 - Verify

Now verify the receipt.

The verifier checks the schema, artifact hash, signature, deployment identity, attestation mode, and timestamp. If the artifact body changed after signing, verification fails.

This is the trust boundary: verification proves the decision record came from the deployed evaluator and was not altered. It does not prove the verdict is objectively correct.

## 2:25 - Tamper

Now tamper with the receipt by changing the score.

The hash no longer matches. The signature is invalid. The UI shows the original score, tampered score, embedded hash, recomputed hash, and failed signature check.

That is the point: ProofJudge does not make AI judgment perfect. It makes AI judgment accountable.

## 2:50 - EigenCloud

Open the EigenVerify link for the Code deployment:

```text
https://verify.eigencloud.xyz/app/0xd3647631C4706be744BE813cD0226e4f149e5aC0
```

EigenCompute matters because the evaluator has a deployment identity. If this were just hosted on a generic cloud endpoint, counterparties would have weaker proof of which evaluator produced the receipt. The receipt matters because downstream systems can verify, store, appeal, or settle against the decision artifact.

## 3:00 - Close

ProofJudge turns AI judgment from an unverifiable opinion into an accountable settlement artifact.
