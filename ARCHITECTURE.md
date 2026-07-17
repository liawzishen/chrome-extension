# Exam-Cram system architecture

## Architectural intent

Exam-Cram is organized around one trustworthy study loop: a deliberately chosen source becomes evidence-linked practice and a durable next study action. The design favors explicit provenance, stable ownership, and a deterministic judge path over feature breadth.

## System context

~~~mermaid
flowchart LR
  learner["Student / judge"] --> panel["Chrome side panel"]

  subgraph extension["Exam-Cram Chrome extension"]
    panel --> capture["Source capture and normalization"]
    panel --> demo["Curated Mathematics demo"]
    capture --> validation["Evidence and artifact validation"]
    demo --> validation
    validation --> storage["Chrome storage: source, artifact, Journey"]
    panel --> worker["Service worker: privileged actions"]
    worker --> storage
  end

  validation -. "optional AI generation" .-> backend["Loopback Node.js backend"]
  backend --> provider["Configured AI provider"]
  storage --> panel
~~~

The curated Mathematics route never depends on the backend or a provider key. It uses the same source, artifact, validation, and Journey contracts as a normal study source so the zero-setup experience is representative rather than a separate mock.

## Component boundaries

| Boundary | Owns | Must not own |
| --- | --- | --- |
| Side panel (**popup.js**) | User interaction, rendering, study-loop orchestration, and presentation state | Provider keys, broad browser permission decisions, or direct cross-origin access |
| Source utilities | Bounded extraction and normalization for notes, pages, documents, and video evidence | Journey progress policy or UI state |
| Artifact validation | Schema checks, source-quote matching, and source identity propagation | Silent evidence invention |
| Journey domain (**journey-utils.js**) | Stable chapter IDs, source ownership, saved artifacts, quiz outcomes, and next-step data | Transient visual state or provider calls |
| Service worker (**background.js**) | Serialized privileged browser work, storage coordination, Focus state, and video authorization | Rendering or unvalidated study artifacts |
| Loopback backend (**server.js**) | Bounded request handling, authorization, provider isolation, structured output normalization, and rate limits | Long-lived learner state or browser credentials |

## Trust-bearing data contracts

The contracts below are the architectural center of the product. A title alone is never treated as evidence ownership.

| Contract | Required identity | Integrity rule |
| --- | --- | --- |
| Source snapshot | **sourceId**, source fingerprint, source type, normalized source text or timestamped segment | Every downstream artifact stays attached to this exact snapshot. |
| Visual claim | Claim text plus source quote/reference | The quote must be present in the saved source before the claim is presented as evidence-linked. |
| Quiz question | Source ID/fingerprint and supporting source text | The question is validated against the source before it is saved or scored. |
| Journey record | Stable **chapterId**, source ID, artifact/session ID | A rerun updates the same chapter/source rather than creating ambiguous duplicate ownership. |
| Unsupported-claim report | Claim identifier and supporting quote only | Reports remain local and do not overwrite the source or alter mastery. |

## Primary flows

### Zero-setup Mathematics demo

~~~mermaid
sequenceDiagram
  participant U as Judge
  participant P as Side panel
  participant V as Evidence validation
  participant J as Journey storage

  U->>P: Try 60-sec math demo
  P->>P: Build deterministic linear-equations source
  P->>V: Bind every visual claim to an exact quote
  V-->>P: Evidence checked
  P->>J: Upsert source into Demo - Linear Equations
  U->>P: Answer x = 6
  P->>V: Validate one source-checked question
  P->>J: Record submitted result in same chapter
  J-->>P: Updated next study action
~~~

### Normal learner source

1. The learner explicitly selects a chapter and captures a bounded source.
2. The extension normalizes the source into a fingerprinted snapshot.
3. A local deterministic path or optional backend returns a structured study artifact.
4. Validation binds each visual claim and quiz question to the source snapshot before persistence.
5. The Journey records the saved source and submitted quiz result under the selected stable chapter.

If optional generation is unavailable, the interface preserves the source binding and labels the fallback state; it does not present unavailable provider output as verified.

## Security and privacy boundaries

- Provider keys live only in the local backend environment and are never bundled into the extension.
- The backend binds requests to approved origins, applies bounded JSON bodies, timeouts, rate limits, concurrency limits, and defensive response headers.
- Browser and host permissions are requested only for the action that needs them.
- The judge demo requires neither a provider key nor browser permissions.
- Unsupported-claim reports keep only the claim/evidence metadata locally; they do not capture a learner's full source text.

## Maintenance rules

1. Add a study feature only when it reinforces the source-to-practice-to-Journey loop.
2. Keep curated demo content in a named deterministic builder and test it separately from provider-driven flows.
3. Require a source ID and fingerprint whenever an artifact crosses a component boundary.
4. Make background or backend changes behind a narrow message/API contract and cover them with contract tests.
5. Treat a visible evidence status and claim-report path as product behavior, not decorative UI.

The detailed implementation inventory and verification commands remain in [the technical specification](hackathon/TECHNICAL_SPEC.md).
