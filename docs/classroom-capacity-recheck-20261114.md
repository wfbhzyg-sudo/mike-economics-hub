# Classroom capacity recheck — 2026-11-14

The 200-student burst retained every submission, but database connection waiting
raised the P95 double-click hand-in time to 6.801 seconds in the cloud fixture.
The bounded homework pool now defaults to 16 connections (previously 8).
`HOMEWORK_DB_POOL_MAX` can override this, with a hard ceiling of 32 and a default
of 16 for invalid values. The production database was checked before this change:
100 maximum connections, 11 currently open, and no existing pool override.
Transaction scope locks, same-student serialization, grading and receipt IDs are
unchanged. No schema/data migration is required.

Imported course files with a verified SHA-256 now support private conditional
revalidation. Authentication and file authorization run before any 304 response.
Cached media varies by Cookie. Range requests, original downloads, and uploads
without a content hash keep their existing behavior. Reopening 200 question
images avoided resending 8,235,628 bytes of image bodies. Revoked access still
returned 404, anonymous access 401, and PDF ranges 206 with exact bytes.

## Final cloud measurements

Independent synthetic accounts, 50 students per class. P95 is per-user completion
of each action group, except the sustained traffic row (per HTTP request).

| Scenario | 150 students | 200 students |
| --- | ---: | ---: |
| Simultaneous password login | 6.701 s | 8.123 s |
| Dashboard entry | 4.338 s | 5.994 s |
| Three 256 KiB PDF ranges | 2.596 s | 3.270 s |
| Open paper and question image | 2.040 s | 2.852 s |
| Simultaneous answer save | 1.453 s | 1.903 s |
| Double-click hand-in | 2.762 s | 3.672 s |
| Sustained mixed reads/writes | 0.166 s | 0.187 s |

The final 200-student sustained phase ran for 300 seconds and completed 38,009
requests without failures. Initial synchronized login/entry still takes several
seconds; these results do not imply instant cold starts.

## Correctness and recovery

- Both 150- and 200-user runs independently checked every answer and every score
  on 40-item papers, including wrong, missing, and last-moment changed answers.
  Each student had exactly one durable submission; MCQ generated no AI jobs.
- Duplicate clicks and stale/empty payload retries returned the original receipt
  without overwriting submitted work. Teacher-confirmed grades matched; peers
  could not access another student's receipt.
- Cloud: 200 photo originals matched their checksums; 200 FRQ submissions each
  had one durable job. Restarting the application preserved all attempt/submission
  fingerprints and grades. Actual AI calls were not made.
- Cloud: 200 canceled requests were retried successfully into exactly 200 scored
  submissions. Locally, restarting during hand-in interrupted 110 clients after
  90 commits; retries produced exactly 200 submissions and correct scores.
- Local: 200 twenty-page synthetic PDFs preserved their original bytes; 200 cold
  and warm PDF worker downloads passed compression and content checks. Ten
  published grade/mistake summaries matched their expected error counts.
- 133 standard automated cases passed; the skipped real-PostgreSQL concurrency
  case was separately executed and passed, for 134 distinct passing cases.

## Scope

The isolated Railway fixture used Node 22 for the portal, Node 24 for identity,
and a local PostgreSQL/object-storage fixture in one container. User HTTP requests
traversed public HTTPS; every DB query had an added 10 ms delay. The fixture
contained 3,512 question records, 2,000 synthetic historical submissions and real
course PDF/image assets. It is not a production multi-service topology replica,
a physical-phone test, or a school Wi-Fi benchmark. FRQ receipt/queue durability
was tested, not DeepSeek throughput or grading quality. No production accounts,
grades, assignments, volumes or source attachments were used as test fixtures.

Detailed measurements and data-preservation evidence are retained in the local
project's `operations/capacity-recheck-20261114` run folder.
