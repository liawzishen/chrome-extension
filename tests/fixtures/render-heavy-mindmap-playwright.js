async (page) => {
  const fixture = {
    summary: [
      "Distributed services trade consistency, availability, and partition tolerance against user-visible correctness.",
      "Replication, coordination, conflict handling, and recovery determine the guarantee that users actually receive."
    ],
    visualModel: {
      title: "Consistency and recovery in a replicated service",
      objective: "Trace how a client request moves through replication, coordination, failure detection, conflict handling, and recovery.",
      kind: "system",
      nodes: [
        { id: "request", label: "Client request and user-visible correctness expectation", role: "Entry point", detail: "The request starts with a correctness expectation.", why: "It defines the internal guarantee.", example: "A checkout retry must not create two orders.", sourceText: "Start from the correctness guarantee that matters to the user." },
        { id: "routing", label: "Request routing across regions and unavailable replicas", role: "Traffic control", detail: "Routing selects a suitable replica.", why: "Local replicas can be fast but stale.", example: "Route a password change to the leader.", sourceText: "Routing combines health, locality, lag, and consistency." },
        { id: "replication", label: "Replication log, quorum acknowledgement, and durable commit boundary", role: "Durability", detail: "Replicas record ordered changes.", why: "Acknowledgement controls accepted-write loss risk.", example: "A volatile single copy may disappear.", sourceText: "The commit boundary defines durable acknowledgement." },
        { id: "consistency", label: "Consistency guarantee observed by concurrent readers and writers", role: "Contract", detail: "The service defines the order clients may observe.", why: "Guarantees shape availability and application complexity.", example: "Inventory requires more control than a view counter.", sourceText: "Consistency is an observable contract." },
        { id: "failure", label: "Failure detection under delay, packet loss, and network partitions", role: "Uncertainty", detail: "Timeouts imply suspicion rather than proof.", why: "False failure declarations can cause split brain.", example: "A delayed heartbeat should not force promotion.", sourceText: "Silence does not prove a process has stopped." },
        { id: "conflicts", label: "Conflict detection and deterministic policy for concurrent updates", role: "Convergence", detail: "Concurrent writes require a deterministic policy.", why: "It prevents divergent final state.", example: "A cart can merge additions; a bank balance cannot.", sourceText: "Conflict rules must match data meaning." },
        { id: "recovery", label: "Recovery, replay, idempotency, and reconciliation after restoration", role: "Repair", detail: "Recovery replays and repairs durable state.", why: "Restarting alone can preserve inconsistency.", example: "Payment retries use an idempotency key.", sourceText: "Recovery includes replay and reconciliation." },
        { id: "observability", label: "Observability for replica lag, quorum health, retries, and impact", role: "Feedback", detail: "Signals connect internals to user guarantees.", why: "Healthy processes can still serve stale state.", example: "Alert on lag and read freshness.", sourceText: "Measure promised behavior and recovery progress." }
      ],
      edges: [
        { from: "request", to: "routing", label: "enters through" },
        { from: "routing", to: "replication", label: "selects replica for" },
        { from: "replication", to: "consistency", label: "implements" },
        { from: "failure", to: "routing", label: "changes availability decisions" },
        { from: "failure", to: "replication", label: "triggers quorum change" },
        { from: "replication", to: "conflicts", label: "exposes concurrent updates" },
        { from: "conflicts", to: "recovery", label: "requires reconciliation" },
        { from: "recovery", to: "consistency", label: "restores guarantee" },
        { from: "observability", to: "failure", label: "provides evidence" },
        { from: "observability", to: "recovery", label: "tracks progress" },
        { from: "request", to: "consistency", label: "defines contract" },
        { from: "routing", to: "observability", label: "emits signals" }
      ],
      scenarios: [],
      check: {},
      suggestedQuestions: []
    }
  };
  await page.evaluate((fixture) => {
    window.__examCramMindMapFixture = fixture;
    window.renderVisualTutorNote({
      title: fixture.visualModel.title,
      objective: fixture.visualModel.objective,
      visualModel: fixture.visualModel,
      blocks: []
    }, fixture.summary, { sourceType: "notes", title: fixture.visualModel.title });
  }, fixture);
}
