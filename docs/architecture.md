# ProofJudge Architecture

## System View

```mermaid
flowchart LR
  User["Builder or reviewer"] --> UI["ProofJudge web UI"]
  UI --> API["Express API"]
  API --> Runtime["Shared judge runtime"]
  Runtime --> Code["Code variant"]
  Runtime --> Research["Research variant"]
  Runtime --> Negotiation["Negotiation variant"]
  Runtime --> Artifact["DecisionArtifact JSON"]
  Artifact --> Signature["Signature adapter"]
  Artifact --> Identity["Deployment identity adapter"]
  Identity --> Eigen["EigenCompute TEE metadata"]
```

## Request Flow

```mermaid
sequenceDiagram
  participant U as User
  participant W as Web UI
  participant A as API
  participant J as Judge Runtime
  participant S as Signature Adapter
  participant E as Eigen Identity Adapter

  U->>W: Select variant and submit artifact
  W->>A: POST /api/judge
  A->>J: Validate and score request
  J->>E: Attach app id, instance ip, attestation metadata
  J->>S: Sign unsigned artifact
  S-->>J: Signature
  J-->>A: DecisionArtifact
  A-->>W: JSON artifact
  W-->>U: Decision, score, evidence fields
```

## Boundaries

- `src/server.ts` owns HTTP routing and static asset serving.
- `src/judge.ts` owns request validation, scoring, artifact construction, and signing.
- `src/variants.ts` owns variant-specific configuration and seeded examples.
- `src/public/*` owns the Demo Day UI.
- `docs/*` owns submission material.

## EigenCloud Integration Points

- Docker runtime binds to `0.0.0.0:${PORT}`.
- Dockerfile keeps `USER root`, matching the quickstart constraint for EigenCompute alpha deployment.
- Deployment metadata is injected through `EIGEN_APP_ID`, `EIGEN_INSTANCE_IP`, and `EIGEN_ATTESTATION_ENDPOINT`.
- The current app labels missing attestation values as `demo-placeholder`.

## Future Integrations

- Replace deterministic local scoring with EigenCloud LLM proxy calls.
- Store artifacts in persistent encrypted state when AgentKit-compatible storage is available.
- Anchor decision hashes onchain.
- Verify TEE attestation in the UI before showing a decision as externally verifiable.
