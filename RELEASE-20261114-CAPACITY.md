# Classroom concurrency, 2026-11-14

The previous version rejected 132 of 200 simultaneous sign-ins at its upstream password queue. With 2,000 synthetic historical submissions, concurrent dashboard reads also fetched every student's full paper/rubric snapshots, yielding a local p95 of 9.96 seconds.

This release filters grades, attempts and corrections in PostgreSQL, adds non-blocking indexes, removes the global write lock from ordinary identity reads, and lets independent student saves run together. Scoped writes still share an exclusion gate with teacher publishing/regrading transactions; same-student/assignment saves remain serialized. Large private JSON responses use asynchronous gzip with no-store. Sign-in deadlines now accommodate the bounded classroom queue in the separately released identity service.

No account, score, assignment, attachment, URL or source material is removed or migrated. MCQ grading remains deterministic with no AI calls. FRQ submission accepts work into the existing durable queue; external AI throughput is a separate constraint.

Validation: 127 automated portal checks, plus a real PostgreSQL test of scoped locks, global exclusion, rollback and filters. Local isolated load fixtures contain 200 students, 4 classes, 12 units, 3,512 questions and 2,000 previous submissions. Tests include simultaneous logins, dashboard/range/image reads, autosaves, duplicate submissions, photo uploads, Bookself progress, EconQuest bootstrap, and teacher-review/correction continuity. A separate sensitivity run adds 10 ms to every database query. Full operational results live in operations/capacity-20261114 in the local project workspace.

Capacity findings are local measurements, not a production SLA: Mac M5 Pro/48 GB, Node 24, PostgreSQL 18, local object storage; production uses Node 22. No 200-user production write load or external AI load was performed. Production health/access control and original record fingerprints must be checked after both deployments succeed.
