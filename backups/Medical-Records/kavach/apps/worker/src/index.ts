// Worker entry point — background job processor
// Uses BullMQ with Redis for queue management.
// Jobs: ingestion pipeline, summary generation, S3 lifecycle

import { ingestionQueue } from "./jobs/ingestion";
import { summaryQueue } from "./jobs/summary";

console.log("[worker] Kavach background worker starting...");

// TODO: Set up BullMQ workers when implementing
// ingestionQueue.process(...)
// summaryQueue.process(...)

console.log("[worker] Queues initialized (stub)");
