# ProofJudge

ProofJudge is a private-preview EigenCloud submission scaffold: one reusable verifiable-agent runtime with three focused judging agents.

- ProofJudge Code evaluates a PR or diff against a bounty rubric.
- ProofJudge Research evaluates a research brief against source and rubric requirements.
- ProofJudge Negotiation evaluates an offer or proposal against stated constraints.

The first shipping target is ProofJudge Code. Research and Negotiation share the runtime, but whether they count as separate paid agents should be validated with the Eigen mentor before packaging or deploying them separately.

The local version is intentionally tight: an Express API, a static demo UI, deterministic judging heuristics, a `DecisionArtifact` JSON record, and a `Verify Decision` audit trail. Current-alpha Eigen attestation and signing are represented through clean adapters and clearly labeled demo-mode metadata until real deployment values are available.

## Local Setup

```bash
npm install
$env:PORT=3001; npm run dev
```

Open `http://localhost:3001/agents/code`.

Dedicated local routes:

- `http://localhost:3001/agents/code`
- `http://localhost:3001/agents/research`
- `http://localhost:3001/agents/negotiation`

Run checks:

```bash
npm run check
```

## Local Docker Test

If another app already uses Windows port `3000`, keep ProofJudge's container port at `3000` and map a different host port:

```bash
npm run check
npm run build
docker build --platform linux/amd64 -t proofjudge-code:local .
docker run --rm -p 3002:3000 --env-file .env.example proofjudge-code:local
```

Open `http://localhost:3002/agents/code`.

The `3002:3000` mapping means:

- `3002` is the Windows host port you open in the browser.
- `3000` is the container port used by the app and EigenCompute.

## EigenCompute Deployment

Install and authenticate the EigenCloud CLI:

```bash
npm install -g @layr-labs/ecloud-cli
ecloud auth login
```

Build for EigenCompute's expected architecture:

```bash
docker buildx build --platform linux/amd64 -t YOUR_REGISTRY/proofjudge:latest .
docker push YOUR_REGISTRY/proofjudge:latest
```

Deploy with the `ecloud` CLI following the private-preview quickstart flow. Set the service port to `3000`, and make sure the app is reachable on `0.0.0.0:3000`. After deployment, fill `EIGEN_APP_ID`, `EIGEN_INSTANCE_IP`, and any attestation endpoint values in the EigenCloud environment settings.

Do not put private keys or wallet secrets in this repository. Use `.env.example` as the contract and set real values through your local shell or EigenCloud environment config.

## Submission Strategy

1. Deploy ProofJudge Code live first.
2. Confirm the public URL, logs, and `Verify Decision` flow.
3. Ask the Eigen mentor whether shared-runtime variants count as three agents or require separate deployments.
4. Package Research and Negotiation as separate routes or separate EigenCompute apps based on that answer.

## Deliverables

- Agent explainer: [docs/agent-explainer.md](docs/agent-explainer.md)
- Architecture: [docs/architecture.md](docs/architecture.md)
- Product feedback: [docs/feedback.md](docs/feedback.md)
- Demo Day script: [docs/demo-day.md](docs/demo-day.md)
- Submission checklist: [docs/submission-checklist.md](docs/submission-checklist.md)
