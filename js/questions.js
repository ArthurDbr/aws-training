// Question bank for the AWS Certified Developer – Associate exam (DVA-C02 / DVA-C03).
//
// Each question:
//   id          unique string
//   domain      1 = Development with AWS Services
//               2 = Security
//               3 = Deployment
//               4 = Troubleshooting and Optimization
//   q           question text
//   options     list of answer choices
//   answer      list of indexes into `options` (more than one => "choose N" question)
//   explanation why the answer is right (and why traps are wrong)
//   tags        optional; "c03" marks topics new/expanded in DVA-C03 (generative AI)

const DOMAINS = {
  1: "Development with AWS Services",
  2: "Security",
  3: "Deployment",
  4: "Troubleshooting and Optimization",
};

const QUESTIONS = [
  // ───────────────────────── Domain 1 — Development ─────────────────────────
  {
    id: "dev-01",
    domain: 1,
    q: "An application reads an item from a DynamoDB table immediately after writing it and must always get the latest value. What should the developer do?",
    options: [
      "Set ConsistentRead to true on the GetItem request",
      "Read the item from a global secondary index",
      "Enable DynamoDB Streams on the table",
      "Use a Scan operation instead of GetItem",
    ],
    answer: [0],
    explanation:
      "Reads are eventually consistent by default. ConsistentRead=true returns the latest committed value (it costs twice the RCUs). GSIs only support eventually consistent reads.",
  },
  {
    id: "dev-02",
    domain: 1,
    q: "A DynamoDB table already in production has partition key UserId. The team now needs to query items efficiently by OrderStatus. What should they create?",
    options: [
      "A local secondary index with OrderStatus as sort key",
      "A global secondary index with OrderStatus as partition key",
      "A new table and migrate the data",
      "A DAX cluster in front of the table",
    ],
    answer: [1],
    explanation:
      "A GSI can use a different partition key and can be added at any time. An LSI must keep the same partition key and can only be created together with the table.",
  },
  {
    id: "dev-03",
    domain: 1,
    q: "An application performs 10 strongly consistent reads per second of items that are 6 KB each. How many read capacity units (RCUs) are needed?",
    options: ["10", "15", "20", "60"],
    answer: [2],
    explanation:
      "1 RCU = one strongly consistent read per second of up to 4 KB. 6 KB rounds up to 8 KB = 2 RCUs per read. 10 × 2 = 20 RCUs. (Eventually consistent would be half: 10.)",
  },
  {
    id: "dev-04",
    domain: 1,
    q: "An application writes 12 items per second to DynamoDB. Each item is 2.5 KB. How many write capacity units (WCUs) are required?",
    options: ["12", "30", "36", "24"],
    answer: [2],
    explanation:
      "1 WCU = one write per second of up to 1 KB. 2.5 KB rounds up to 3 KB = 3 WCUs per write. 12 × 3 = 36 WCUs.",
  },
  {
    id: "dev-05",
    domain: 1,
    q: "Two users can update the same DynamoDB item at the same time, and one update sometimes overwrites the other. How can the developer prevent lost updates without a separate locking service?",
    options: [
      "Use a version attribute and a ConditionExpression on UpdateItem (optimistic locking)",
      "Enable DynamoDB Streams",
      "Use strongly consistent reads before every write",
      "Increase the table's write capacity",
    ],
    answer: [0],
    explanation:
      "Optimistic locking: the write only succeeds if the version attribute still matches what was read (ConditionExpression). Otherwise a ConditionalCheckFailedException is returned and the client retries.",
  },
  {
    id: "dev-06",
    domain: 1,
    q: "Every time an item is inserted or modified in a DynamoDB table, a Lambda function must send a notification. What is the MOST efficient solution?",
    options: [
      "Schedule a Lambda function every minute to scan the table",
      "Enable DynamoDB Streams and add the stream as an event source for the Lambda function",
      "Configure an S3 event notification",
      "Have the application publish to SNS after every write",
    ],
    answer: [1],
    explanation:
      "DynamoDB Streams captures item-level changes in order; a Lambda event source mapping polls the stream and invokes the function. No polling of the table, no change to the writer code.",
  },
  {
    id: "dev-07",
    domain: 1,
    q: "A Lambda function opens a new database connection on every invocation, which is slow. What is the recommended improvement?",
    options: [
      "Increase the function timeout",
      "Initialize the connection outside the handler so it is reused across invocations in the same execution environment",
      "Store the connection object in an environment variable",
      "Use a Lambda layer for the database driver",
    ],
    answer: [1],
    explanation:
      "Code outside the handler runs once per execution environment (cold start) and is reused for warm invocations. For relational databases, RDS Proxy also helps by pooling connections.",
  },
  {
    id: "dev-08",
    domain: 1,
    q: "A CPU-bound Lambda function runs too slowly. How can the developer give it more CPU?",
    options: [
      "Increase the memory setting",
      "Increase the timeout",
      "Enable provisioned concurrency",
      "Set the CPU parameter in the function configuration",
    ],
    answer: [0],
    explanation:
      "Lambda allocates CPU proportionally to memory (128 MB – 10,240 MB). There is no separate CPU setting. Around 1,769 MB gives one full vCPU.",
  },
  {
    id: "dev-09",
    domain: 1,
    q: "A data processing job takes about 40 minutes and is composed of several steps that must be retried individually on failure. Which service should orchestrate it?",
    options: [
      "A single Lambda function with a 40-minute timeout",
      "AWS Step Functions",
      "Amazon SQS FIFO queue",
      "Amazon SNS",
    ],
    answer: [1],
    explanation:
      "Lambda has a hard 15-minute timeout. Step Functions orchestrates multi-step workflows with per-state Retry/Catch, and Standard workflows can run up to one year.",
  },
  {
    id: "dev-10",
    domain: 1,
    q: "Consumers of an SQS standard queue sometimes process the same message twice. Processing takes about 60 seconds. The queue uses default settings. What is the MOST likely cause?",
    options: [
      "Long polling is disabled",
      "The visibility timeout (default 30 s) is shorter than the processing time",
      "The message retention period is too short",
      "The queue should be encrypted",
    ],
    answer: [1],
    explanation:
      "If a message isn't deleted before the visibility timeout expires, it becomes visible again and another consumer receives it. Increase the visibility timeout (or call ChangeMessageVisibility). Standard queues are at-least-once, so consumers should also be idempotent.",
  },
  {
    id: "dev-11",
    domain: 1,
    q: "An application polling an SQS queue receives many empty responses, increasing cost. What should the developer do?",
    options: [
      "Enable long polling by setting ReceiveMessageWaitTimeSeconds to a value up to 20",
      "Decrease the visibility timeout",
      "Switch to a FIFO queue",
      "Set DelaySeconds to 900",
    ],
    answer: [0],
    explanation:
      "Long polling waits up to 20 seconds for a message to arrive, reducing empty ReceiveMessage responses and API calls.",
  },
  {
    id: "dev-12",
    domain: 1,
    q: "Orders for each customer must be processed in exactly the order they are sent, but orders from different customers can be processed in parallel. Which SQS configuration fits?",
    options: [
      "Standard queue with a delay queue",
      "FIFO queue using the customer ID as MessageGroupId",
      "FIFO queue using a single MessageGroupId for all messages",
      "Standard queue with message timers",
    ],
    answer: [1],
    explanation:
      "FIFO ordering is guaranteed within a message group. One group per customer gives per-customer ordering while different groups are processed in parallel. A single group would serialize everything.",
  },
  {
    id: "dev-13",
    domain: 1,
    q: "When an order is placed, three independent services (billing, shipping, analytics) must each receive and process the event at their own pace. Which architecture is MOST appropriate?",
    options: [
      "One SQS queue polled by all three services",
      "An SNS topic with three SQS queues subscribed (fan-out)",
      "Three Lambda functions invoked synchronously in sequence",
      "A Kinesis Data Firehose delivery stream",
    ],
    answer: [1],
    explanation:
      "SNS + SQS fan-out: SNS delivers a copy to each subscribed queue, and each service consumes its own queue independently with buffering and retries.",
  },
  {
    id: "dev-14",
    domain: 1,
    q: "A Kinesis Data Streams producer receives ProvisionedThroughputExceededException although the overall stream traffic is well below total capacity. What is the MOST likely cause?",
    options: [
      "The retention period is too short",
      "A poorly distributed partition key is creating a hot shard",
      "The consumer is using enhanced fan-out",
      "Server-side encryption is enabled",
    ],
    answer: [1],
    explanation:
      "Each shard accepts 1 MB/s or 1,000 records/s. If most records share a partition key, they land on one shard. Use a higher-cardinality partition key (and retry with backoff).",
  },
  {
    id: "dev-15",
    domain: 1,
    q: "An application uses ElastiCache with lazy loading. Users sometimes see stale data after an update. Which change reduces stale data while keeping the cache efficient?",
    options: [
      "Use write-through caching and set a TTL on keys",
      "Disable the cache",
      "Switch from Redis to Memcached",
      "Increase the cache node size",
    ],
    answer: [0],
    explanation:
      "Write-through updates the cache whenever the database is written, so data is never stale. Adding a TTL limits wasted memory for data written but never read (and caps staleness for lazy-loaded keys).",
  },
  {
    id: "dev-16",
    domain: 1,
    q: "A web app must let users upload files directly to a private S3 bucket without giving them AWS credentials. What should the backend provide?",
    options: [
      "A presigned URL for a PUT operation",
      "The bucket's access keys",
      "A public-write bucket policy",
      "An S3 Access Point with public access",
    ],
    answer: [0],
    explanation:
      "A presigned URL is signed with the backend's credentials and grants time-limited permission for one specific operation on one object.",
  },
  {
    id: "dev-17",
    domain: 1,
    q: "An API Gateway REST API has dev and prod stages. Each stage must invoke a different alias of the same Lambda function. What is the simplest way?",
    options: [
      "Create two separate APIs",
      "Use a stage variable in the Lambda integration ARN (e.g. function:${stageVariables.alias})",
      "Use a usage plan per stage",
      "Use a Lambda authorizer to route the request",
    ],
    answer: [1],
    explanation:
      "Stage variables act like environment variables for API stages. Referencing one in the integration ARN routes each stage to a different alias. Remember to grant API Gateway permission to invoke each alias.",
  },
  {
    id: "dev-18",
    domain: 1,
    q: "An API Gateway REST API with Lambda proxy integration returns HTTP 502 Bad Gateway, but the Lambda logs show the function succeeded. What is the MOST likely cause?",
    options: [
      "The function returned a response not in the required format (statusCode, headers, body as a string)",
      "The API is not deployed",
      "The Lambda function timed out",
      "The API key is missing",
    ],
    answer: [0],
    explanation:
      "With proxy integration, Lambda must return a JSON object with statusCode, optional headers, and body as a string. A malformed response results in 502 'Malformed Lambda proxy response'.",
  },
  {
    id: "dev-19",
    domain: 1,
    q: "A Step Functions workflow must pause until a manager approves a request via email, which can take days. How should the developer implement this?",
    options: [
      "Use a Wait state with a 7-day timer",
      "Use a task with the .waitForTaskToken integration pattern and call SendTaskSuccess when approved",
      "Use a Lambda function that sleeps until approval",
      "Use a Parallel state",
    ],
    answer: [1],
    explanation:
      "The callback pattern (.waitForTaskToken) pauses the execution until SendTaskSuccess/SendTaskFailure is called with the token, which the approval link can trigger.",
  },
  {
    id: "dev-20",
    domain: 1,
    q: "A Lambda function invoked asynchronously occasionally fails after all retries, and the events are lost. How can the developer capture failed events for later analysis? (Choose TWO.)",
    options: [
      "Configure an on-failure destination (SQS, SNS, Lambda or EventBridge)",
      "Configure a dead-letter queue on the function",
      "Increase the reserved concurrency",
      "Enable X-Ray active tracing",
      "Switch to synchronous invocation",
    ],
    answer: [0, 1],
    explanation:
      "For asynchronous invocations Lambda retries twice, then sends the event to a DLQ (SQS/SNS) or an on-failure destination. Destinations are newer and include more context (error, response).",
  },
  {
    id: "dev-21",
    domain: 1,
    q: "A Lambda function processes SQS messages in batches of 10. When one message fails, the whole batch is retried and successful messages are reprocessed. How can this be avoided?",
    options: [
      "Set the batch size to 1",
      "Enable ReportBatchItemFailures and return the IDs of failed messages",
      "Increase the visibility timeout",
      "Use a FIFO queue",
    ],
    answer: [1],
    explanation:
      "With ReportBatchItemFailures, the function returns batchItemFailures; only those messages become visible again. Batch size 1 works but reduces throughput.",
  },
  {
    id: "dev-22",
    domain: 1,
    q: "A mobile app needs a GraphQL API with real-time subscriptions on top of DynamoDB. Which service should be used?",
    options: ["Amazon API Gateway REST API", "AWS AppSync", "Amazon SNS mobile push", "AWS Amplify Hosting"],
    answer: [1],
    explanation:
      "AppSync is a managed GraphQL service with resolvers for DynamoDB, Lambda, etc., and real-time subscriptions over WebSockets.",
  },
  {
    id: "dev-23",
    domain: 1,
    q: "A report regularly scans a large DynamoDB table and consumes so much capacity that production requests are throttled. Which TWO actions reduce the impact? (Choose TWO.)",
    options: [
      "Replace the Scan with a Query on an appropriate key or index where possible",
      "Use a smaller page size (Limit) to spread the scan over time",
      "Use strongly consistent reads for the scan",
      "Increase the item size",
      "Run more parallel scan segments at once",
    ],
    answer: [0, 1],
    explanation:
      "Query reads only matching partition items. A smaller Limit spreads out the Scan's RCU usage. Strongly consistent reads and more parallel segments consume capacity faster.",
  },
  {
    id: "dev-24",
    domain: 1,
    q: "A thumbnail must be generated every time an image is uploaded to an S3 bucket. What is the simplest serverless solution?",
    options: [
      "An S3 event notification (or EventBridge rule) that invokes a Lambda function on s3:ObjectCreated",
      "A cron job on EC2 listing the bucket every minute",
      "CloudTrail data events processed by Athena",
      "S3 Replication to a second bucket",
    ],
    answer: [0],
    explanation:
      "S3 event notifications trigger Lambda on object creation. Avoid writing output to the same prefix that triggers the function, or you create a recursive loop.",
  },
  {
    id: "dev-25",
    domain: 1,
    q: "A Lambda function must run every day at 02:00 UTC. What is the recommended way to schedule it?",
    options: [
      "Amazon EventBridge Scheduler (or a scheduled EventBridge rule) with a cron expression",
      "An SQS delay queue",
      "A CloudWatch alarm",
      "A Step Functions Wait state that loops forever",
    ],
    answer: [0],
    explanation: "EventBridge Scheduler / scheduled rules support cron and rate expressions to invoke targets such as Lambda.",
  },
  {
    id: "dev-26",
    domain: 1,
    q: "Which DynamoDB API lets a developer write to several items across multiple tables so that either all writes succeed or none do?",
    options: ["BatchWriteItem", "TransactWriteItems", "PutItem with a ConditionExpression", "UpdateItem with ReturnValues"],
    answer: [1],
    explanation:
      "TransactWriteItems provides ACID all-or-nothing writes (up to 100 actions). BatchWriteItem is not atomic: some items may fail (returned as UnprocessedItems). Transactions consume 2× capacity.",
  },
  {
    id: "dev-27",
    domain: 1,
    q: "Session data in DynamoDB should be deleted automatically 24 hours after creation, at no extra cost. What should the developer use?",
    options: [
      "A scheduled Lambda function that deletes old items",
      "DynamoDB Time to Live (TTL) on an epoch-seconds expiry attribute",
      "DynamoDB Streams",
      "An S3 lifecycle policy",
    ],
    answer: [1],
    explanation:
      "TTL deletes expired items automatically without consuming WCUs. Deletion is not immediate (typically within a few days), so filter out expired items in reads if exactness matters.",
  },

  // ───────────────────────── Domain 2 — Security ─────────────────────────
  {
    id: "sec-01",
    domain: 2,
    q: "A mobile app needs user sign-up and sign-in, then must let signed-in users upload directly to S3 using temporary AWS credentials. Which combination should be used?",
    options: [
      "Cognito user pool for authentication + Cognito identity pool to obtain temporary AWS credentials",
      "IAM users for each app user",
      "Cognito user pool only",
      "Store an access key in the mobile app",
    ],
    answer: [0],
    explanation:
      "User pools handle sign-up/sign-in and issue JWTs. Identity pools exchange those tokens for temporary IAM credentials (via STS) scoped by an IAM role.",
  },
  {
    id: "sec-02",
    domain: 2,
    q: "A developer must encrypt a 2 MB file using AWS KMS. What is the correct approach?",
    options: [
      "Call KMS Encrypt with the file as plaintext",
      "Call GenerateDataKey, encrypt the file locally with the plaintext data key, store the encrypted data key with the file, and discard the plaintext key",
      "Split the file into 4 KB chunks and call Encrypt for each",
      "Export the KMS key and encrypt locally",
    ],
    answer: [1],
    explanation:
      "KMS Encrypt accepts at most 4 KB. For larger data use envelope encryption with GenerateDataKey (the AWS Encryption SDK does this for you). KMS keys never leave KMS.",
  },
  {
    id: "sec-03",
    domain: 2,
    q: "An application needs database credentials that are rotated automatically every 30 days. Which service is the BEST fit?",
    options: [
      "AWS Secrets Manager with automatic rotation",
      "SSM Parameter Store standard String parameter",
      "Lambda environment variables",
      "An encrypted file in S3",
    ],
    answer: [0],
    explanation:
      "Secrets Manager has built-in rotation (managed rotation for RDS, Aurora, Redshift, DocumentDB, or a custom rotation Lambda). Parameter Store has no native rotation.",
  },
  {
    id: "sec-04",
    domain: 2,
    q: "A Lambda function needs to read objects from an S3 bucket. What is the MOST secure way to grant access?",
    options: [
      "Store access keys in environment variables",
      "Attach a policy granting s3:GetObject on the bucket to the function's execution role",
      "Make the bucket public",
      "Hard-code the root account keys",
    ],
    answer: [1],
    explanation:
      "Lambda assumes its execution role and the SDK picks up temporary credentials automatically. Grant least privilege: only the actions and resources needed.",
  },
  {
    id: "sec-05",
    domain: 2,
    q: "An application on EC2 must call DynamoDB. Where should its AWS credentials come from?",
    options: [
      "An IAM role attached to the instance via an instance profile",
      "~/.aws/credentials with an IAM user's long-term keys",
      "Credentials embedded in the AMI",
      "A config file in the application repository",
    ],
    answer: [0],
    explanation:
      "Instance profiles provide temporary, auto-rotated credentials through the instance metadata service. The SDK default credential chain finds them automatically.",
  },
  {
    id: "sec-06",
    domain: 2,
    q: "An application in Account A must write to an S3 bucket in Account B using temporary credentials. What should the developer do?",
    options: [
      "Create an IAM user in Account B and share its keys",
      "Create a role in Account B that trusts Account A, and have the application call sts:AssumeRole",
      "Use the root user of Account B",
      "Enable S3 Cross-Region Replication",
    ],
    answer: [1],
    explanation:
      "Cross-account access: a role in the target account with a trust policy for the source account. The caller also needs sts:AssumeRole permission on that role in its own account.",
  },
  {
    id: "sec-07",
    domain: 2,
    q: "An API Gateway REST API must validate bearer tokens issued by a third-party OAuth provider, using custom logic. What should be configured?",
    options: ["A Lambda authorizer", "IAM authorization", "An API key and usage plan", "A resource policy"],
    answer: [0],
    explanation:
      "A Lambda (custom) authorizer runs your code to validate the token and returns an IAM policy. Results can be cached. If tokens came from a Cognito user pool, a Cognito authorizer would be simpler. API keys are for throttling/quotas, not authentication.",
  },
  {
    id: "sec-08",
    domain: 2,
    q: "Compliance requires an audit trail of every use of the encryption key protecting S3 objects, and the ability to control who can use the key. Which encryption option should be used?",
    options: ["SSE-S3", "SSE-KMS with a customer managed key", "SSE-C", "No server-side encryption; use HTTPS only"],
    answer: [1],
    explanation:
      "SSE-KMS logs key usage in CloudTrail, and a customer managed key lets you control its key policy and rotation. SSE-S3 keys are fully managed by AWS with no per-use audit.",
  },
  {
    id: "sec-09",
    domain: 2,
    q: "How can a developer ensure that all requests to an S3 bucket use HTTPS?",
    options: [
      "Enable default encryption",
      "Add a bucket policy that denies requests when aws:SecureTransport is false",
      "Enable S3 Versioning",
      "Enable Transfer Acceleration",
    ],
    answer: [1],
    explanation: "The aws:SecureTransport condition key is false for plain HTTP requests; an explicit Deny blocks them.",
  },
  {
    id: "sec-10",
    domain: 2,
    q: "An IAM identity policy allows s3:* on a bucket, but the bucket policy contains an explicit Deny for s3:DeleteObject for that user. What happens when the user tries to delete an object?",
    options: [
      "Allowed, because the identity policy allows s3:*",
      "Denied, because an explicit Deny always overrides an Allow",
      "Allowed only if MFA is used",
      "Depends on which policy was created last",
    ],
    answer: [1],
    explanation: "Policy evaluation: explicit Deny > explicit Allow > implicit deny (default).",
  },
  {
    id: "sec-11",
    domain: 2,
    q: "An EC2 API call fails with an 'encoded authorization failure message'. How can the developer read the details?",
    options: [
      "Use the STS DecodeAuthorizationMessage API",
      "Base64-decode the message",
      "Look in CloudWatch Logs",
      "Use the KMS Decrypt API",
    ],
    answer: [0],
    explanation:
      "aws sts decode-authorization-message returns the decoded reason. The caller needs the sts:DecodeAuthorizationMessage permission.",
  },
  {
    id: "sec-12",
    domain: 2,
    q: "A single-page app hosted on https://app.example.com calls an API Gateway endpoint on another domain, and the browser blocks the responses. What should the developer do?",
    options: [
      "Enable CORS on the API (and return Access-Control-Allow-Origin from the integration for proxy integrations)",
      "Add a Lambda authorizer",
      "Enable API caching",
      "Use a private API",
    ],
    answer: [0],
    explanation:
      "Browsers enforce the same-origin policy. CORS adds the OPTIONS preflight and Access-Control-Allow-* headers. With Lambda proxy integration, the function itself must return those headers.",
  },
  {
    id: "sec-13",
    domain: 2,
    q: "A developer wants to test whether an IAM policy will allow specific actions before deploying it. Which tool should they use?",
    options: ["IAM policy simulator", "AWS Trusted Advisor", "Amazon Inspector", "AWS Config"],
    answer: [0],
    explanation:
      "The IAM policy simulator evaluates identity-based (and some resource-based) policies against chosen actions and resources. The CLI also offers --dry-run for some services such as EC2.",
  },
  {
    id: "sec-14",
    domain: 2,
    q: "Which TWO are valid ways to store a configuration secret (an API key) used by a Lambda function so it is encrypted at rest? (Choose TWO.)",
    options: [
      "AWS Secrets Manager",
      "SSM Parameter Store SecureString",
      "A plaintext constant in the function code",
      "A public S3 object",
      "The function description field",
    ],
    answer: [0, 1],
    explanation:
      "Both encrypt with KMS. Parameter Store SecureString is cheaper (standard tier is free) but has no built-in rotation; Secrets Manager adds rotation and cross-account sharing.",
  },
  {
    id: "sec-15",
    domain: 2,
    q: "An app must let users sign in with their Google or Facebook accounts and also with email/password, receiving JWT tokens. What should be used?",
    options: [
      "Cognito user pool with social identity providers and the hosted UI",
      "IAM Identity Center",
      "IAM SAML federation",
      "STS GetSessionToken",
    ],
    answer: [0],
    explanation:
      "Cognito user pools support native users and federation with social / SAML / OIDC providers, issuing ID, access and refresh tokens.",
  },
  {
    id: "sec-16",
    domain: 2,
    q: "A containerized application on Amazon ECS needs to read from DynamoDB. Where should the DynamoDB permissions be granted?",
    options: [
      "In the task execution role",
      "In the task role (taskRoleArn)",
      "In the EC2 instance role only",
      "In the ECR repository policy",
    ],
    answer: [1],
    explanation:
      "The task role is assumed by the application inside the container. The task execution role is used by the ECS agent to pull images from ECR, send logs and fetch secrets for the task definition.",
  },

  // ───────────────────────── Domain 3 — Deployment ─────────────────────────
  {
    id: "dep-01",
    domain: 3,
    q: "An Elastic Beanstalk application must be updated with no downtime and without ever reducing capacity below the current number of instances, while minimizing cost. Which deployment policy should be used?",
    options: ["All at once", "Rolling", "Rolling with additional batch", "Immutable"],
    answer: [2],
    explanation:
      "Rolling with additional batch launches an extra batch first so full capacity is kept. Rolling reduces capacity. Immutable also keeps capacity but launches a full new set of instances (more cost, fastest rollback). All at once causes downtime.",
  },
  {
    id: "dep-02",
    domain: 3,
    q: "With Elastic Beanstalk, a team wants the safest deployment with the fastest rollback: new instances in a temporary Auto Scaling group, terminated if health checks fail. Which policy is this?",
    options: ["Rolling", "Immutable", "All at once", "Rolling with additional batch"],
    answer: [1],
    explanation:
      "Immutable deploys to fresh instances in a temporary ASG; if anything fails, terminating them is the rollback. (Traffic splitting adds canary-style traffic shifting on top.)",
  },
  {
    id: "dep-03",
    domain: 3,
    q: "Where must Elastic Beanstalk configuration files (e.g. to install packages or set option settings) be placed in the source bundle?",
    options: [
      "In the .ebextensions folder at the root, with the .config extension",
      "In buildspec.yml",
      "In appspec.yml",
      "In a folder named /config",
    ],
    answer: [0],
    explanation: ".ebextensions/*.config files (YAML or JSON) at the root of the source bundle customize the environment.",
  },
  {
    id: "dep-04",
    domain: 3,
    q: "What is the correct order of these CodeDeploy lifecycle hooks for an EC2/on-premises in-place deployment?",
    options: [
      "BeforeInstall → AfterInstall → ApplicationStart → ValidateService",
      "ApplicationStart → BeforeInstall → AfterInstall → ValidateService",
      "ValidateService → BeforeInstall → ApplicationStart → AfterInstall",
      "BeforeInstall → ApplicationStart → AfterInstall → ValidateService",
    ],
    answer: [0],
    explanation:
      "Full order: ApplicationStop → DownloadBundle → BeforeInstall → Install → AfterInstall → ApplicationStart → ValidateService (plus load-balancer hooks when applicable).",
  },
  {
    id: "dep-05",
    domain: 3,
    q: "A team deploys a new Lambda version with CodeDeploy and wants 10% of traffic on the new version for 5 minutes, then 100% if no alarms fire. Which deployment configuration should be used?",
    options: [
      "LambdaAllAtOnce",
      "LambdaCanary10Percent5Minutes",
      "LambdaLinear10PercentEvery1Minute",
      "Blue/green with an Application Load Balancer",
    ],
    answer: [1],
    explanation:
      "Canary shifts a percentage once, waits, then shifts the rest. Linear shifts equal increments at regular intervals. CodeDeploy shifts traffic between versions using a Lambda alias.",
  },
  {
    id: "dep-06",
    domain: 3,
    q: "In an AWS SAM template, which line is required so CloudFormation can process resources like AWS::Serverless::Function?",
    options: [
      "Transform: AWS::Serverless-2016-10-31",
      "AWSTemplateFormatVersion: '2010-09-09'",
      "Runtime: sam",
      "Resources: Serverless",
    ],
    answer: [0],
    explanation:
      "The Transform tells CloudFormation to expand SAM resources into standard resources. Typical commands: sam build, sam deploy --guided, sam local invoke.",
  },
  {
    id: "dep-07",
    domain: 3,
    q: "A network CloudFormation stack creates a VPC. Several application stacks must reference its subnet IDs. What is the recommended approach?",
    options: [
      "Hard-code the subnet IDs in each stack",
      "Export the values in the network stack's Outputs and use Fn::ImportValue in the other stacks",
      "Use nested stacks with DependsOn",
      "Use Fn::GetAtt across stacks",
    ],
    answer: [1],
    explanation:
      "Cross-stack references: Outputs with Export names (unique per region) + Fn::ImportValue. An exported value can't be deleted or changed while another stack imports it.",
  },
  {
    id: "dep-08",
    domain: 3,
    q: "Before updating a production CloudFormation stack, a developer wants to see which resources will be modified or replaced. What should they use?",
    options: ["A change set", "Stack drift detection", "A stack policy", "Termination protection"],
    answer: [0],
    explanation:
      "Change sets preview the changes (including replacements) before you execute them. Drift detection compares the stack to resources changed outside CloudFormation.",
  },
  {
    id: "dep-09",
    domain: 3,
    q: "Which file does AWS CodeBuild look for by default at the root of the source code to know which commands to run?",
    options: ["appspec.yml", "buildspec.yml", "template.yaml", "Dockerfile"],
    answer: [1],
    explanation:
      "buildspec.yml defines phases (install, pre_build, build, post_build), artifacts, cache and env. appspec.yml is for CodeDeploy.",
  },
  {
    id: "dep-10",
    domain: 3,
    q: "A CodePipeline must stop before the production deployment until a release manager confirms. How is this implemented?",
    options: [
      "Add a Manual approval action in a stage before the deploy stage",
      "Add a Wait state",
      "Disable the transition and re-enable it via a Lambda function",
      "Use a CodeBuild buildspec pause command",
    ],
    answer: [0],
    explanation: "Manual approval actions pause the pipeline and can notify an SNS topic; an authorized user approves or rejects.",
  },
  {
    id: "dep-11",
    domain: 3,
    q: "Several Lambda functions share the same large set of dependencies. How can the developer avoid packaging them in every function?",
    options: [
      "Create a Lambda layer with the dependencies and attach it to each function",
      "Store the dependencies in /tmp",
      "Download them from S3 in the handler on every invocation",
      "Put them in environment variables",
    ],
    answer: [0],
    explanation:
      "Layers package shared libraries (up to 5 per function). The unzipped size of function + layers is limited to 250 MB; beyond that, use a container image (up to 10 GB).",
  },
  {
    id: "dep-12",
    domain: 3,
    q: "A stack contains an RDS database. When the stack is deleted, the team wants a final backup to be taken. Which attribute should be set on the resource?",
    options: ["DeletionPolicy: Snapshot", "DeletionPolicy: Retain", "UpdateReplacePolicy: Delete", "DependsOn"],
    answer: [0],
    explanation:
      "Snapshot creates a final snapshot before deletion (supported for RDS, EBS, ElastiCache, Redshift…). Retain keeps the resource itself.",
  },
  {
    id: "dep-13",
    domain: 3,
    q: "Which TWO statements about Lambda versions and aliases are correct? (Choose TWO.)",
    options: [
      "A published version is immutable (code and configuration)",
      "An alias can split traffic between two versions with weights",
      "$LATEST is immutable",
      "An alias can point to another alias",
      "Each version must be deployed in a different Region",
    ],
    answer: [0, 1],
    explanation:
      "Versions are immutable snapshots; $LATEST is the mutable one. Aliases are pointers to versions (not to other aliases) and support weighted routing between two versions.",
  },
  {
    id: "dep-14",
    domain: 3,
    q: "A developer wants to define infrastructure in TypeScript and deploy it as CloudFormation. Which tool and command produce the CloudFormation template?",
    options: ["AWS CDK — cdk synth", "AWS SAM — sam local", "Elastic Beanstalk — eb init", "CodeDeploy — create-deployment"],
    answer: [0],
    explanation:
      "cdk synth synthesizes CloudFormation templates; cdk deploy deploys them. cdk bootstrap prepares the account/Region (S3 bucket, roles) once.",
  },
  {
    id: "dep-15",
    domain: 3,
    q: "A team wants to roll out a new API Gateway deployment to a small percentage of production traffic and compare metrics before full rollout. What should they use?",
    options: ["A canary release on the stage", "A usage plan", "A new custom domain", "Stage variables only"],
    answer: [0],
    explanation:
      "Stage canary settings route a percentage of requests to the new deployment; you can then promote or delete the canary.",
  },
  {
    id: "dep-16",
    domain: 3,
    q: "A developer needs to change feature flags at runtime for a Lambda application, with validation and gradual rollout, without redeploying code. Which service fits best?",
    options: ["AWS AppConfig", "CloudFormation parameters", "Lambda environment variables", "CodePipeline"],
    answer: [0],
    explanation:
      "AppConfig (part of Systems Manager) manages feature flags and configuration with validators, deployment strategies and automatic rollback on CloudWatch alarms. Changing Lambda env vars requires a configuration update.",
  },
  {
    id: "dep-17",
    domain: 3,
    q: "Which command builds a SAM application and then packages and deploys it, prompting for parameters the first time?",
    options: ["sam build && sam deploy --guided", "sam init && sam local start-api", "cdk deploy", "aws cloudformation validate-template"],
    answer: [0],
    explanation:
      "sam build compiles dependencies into .aws-sam/; sam deploy --guided uploads artifacts to S3 and deploys the CloudFormation stack, saving settings in samconfig.toml.",
  },

  // ─────────────────── Domain 4 — Troubleshooting & Optimization ───────────────────
  {
    id: "trb-01",
    domain: 4,
    q: "A developer adds custom data to AWS X-Ray traces and needs to filter traces by customer ID in the console. How should the customer ID be recorded?",
    options: ["As an annotation", "As metadata", "As a subsegment name", "In a CloudWatch Logs field"],
    answer: [0],
    explanation:
      "Annotations are indexed key-value pairs usable in filter expressions. Metadata is not indexed (use it for extra data you don't search on).",
  },
  {
    id: "trb-02",
    domain: 4,
    q: "An application on EC2 is instrumented with the X-Ray SDK but no traces appear. Which TWO are likely causes? (Choose TWO.)",
    options: [
      "The X-Ray daemon (or CloudWatch agent / ADOT collector) is not running on the instance",
      "The instance role lacks permissions such as xray:PutTraceSegments",
      "X-Ray only works with Lambda",
      "CloudTrail is disabled",
      "The application uses HTTPS",
    ],
    answer: [0, 1],
    explanation:
      "The SDK sends segments over UDP 2000 to a local daemon/agent, which uploads them using the instance role (AWSXRayDaemonWriteAccess). On Lambda, just enable Active tracing.",
  },
  {
    id: "trb-03",
    domain: 4,
    q: "An application must publish a custom CloudWatch metric with 1-second granularity. What should the developer do?",
    options: [
      "Call PutMetricData with StorageResolution set to 1 (high-resolution metric)",
      "Enable detailed monitoring",
      "Create a metric filter",
      "Use a 10-second alarm period on a standard metric",
    ],
    answer: [0],
    explanation:
      "High-resolution custom metrics support 1-second resolution. EC2 detailed monitoring is 1-minute granularity for EC2 metrics only.",
  },
  {
    id: "trb-04",
    domain: 4,
    q: "A Lambda function should emit custom business metrics without the latency of synchronous PutMetricData calls. What is the recommended approach?",
    options: [
      "Write logs in CloudWatch Embedded Metric Format (EMF)",
      "Call PutMetricData in a background thread",
      "Write metrics to DynamoDB",
      "Use X-Ray metadata",
    ],
    answer: [0],
    explanation:
      "EMF is structured JSON written to stdout; CloudWatch Logs extracts metrics from it asynchronously, with no extra API calls from the function.",
  },
  {
    id: "trb-05",
    domain: 4,
    q: "A team wants an alarm whenever the string \"ERROR\" appears in an application's CloudWatch Logs more than 5 times in 5 minutes. What should they create?",
    options: [
      "A metric filter on the log group, then a CloudWatch alarm on the resulting metric",
      "A CloudTrail trail",
      "An X-Ray group",
      "A subscription filter to S3",
    ],
    answer: [0],
    explanation: "Metric filters turn matching log events into a CloudWatch metric that alarms can watch.",
  },
  {
    id: "trb-06",
    domain: 4,
    q: "A Java Lambda function behind an API has unacceptable cold-start latency at peak times. Which TWO options reduce cold starts? (Choose TWO.)",
    options: [
      "Configure provisioned concurrency on an alias",
      "Enable Lambda SnapStart on published versions",
      "Increase the timeout",
      "Enable an SQS dead-letter queue",
      "Reduce reserved concurrency to 1",
    ],
    answer: [0, 1],
    explanation:
      "Provisioned concurrency keeps environments initialized. SnapStart restores from a cached snapshot of the initialized environment (Java, Python, .NET). Both apply to versions/aliases, not $LATEST.",
  },
  {
    id: "trb-07",
    domain: 4,
    q: "A Lambda function returns TooManyRequestsException (HTTP 429) at peak, and it is starving other functions in the account. What should the developer do?",
    options: [
      "Set reserved concurrency on functions to isolate them, and request an account concurrency quota increase if needed",
      "Increase the memory",
      "Increase the timeout",
      "Enable X-Ray",
    ],
    answer: [0],
    explanation:
      "The default account concurrency limit is 1,000 per Region (shared). Reserved concurrency guarantees and caps a function's concurrency so one function can't starve the others.",
  },
  {
    id: "trb-08",
    domain: 4,
    q: "An API Gateway REST API returns HTTP 504 for requests whose Lambda backend takes about 45 seconds. What is the cause?",
    options: [
      "The API Gateway integration timeout (29 seconds by default) is exceeded",
      "The Lambda function has too little memory",
      "API keys are not configured",
      "CORS is not enabled",
    ],
    answer: [0],
    explanation:
      "504 = integration timeout. Make the backend faster or make the pattern asynchronous (return 202 and process in the background, e.g. via SQS or Step Functions).",
  },
  {
    id: "trb-09",
    domain: 4,
    q: "An application receives ProvisionedThroughputExceededException from DynamoDB during short bursts. What should the application do FIRST?",
    options: [
      "Retry with exponential backoff and jitter (the AWS SDKs do this automatically)",
      "Switch to Scan",
      "Disable auto scaling",
      "Use strongly consistent reads",
    ],
    answer: [0],
    explanation:
      "Exponential backoff spreads retries. For sustained load, increase capacity, use on-demand mode, or fix hot keys.",
  },
  {
    id: "trb-10",
    domain: 4,
    q: "A read-heavy application on DynamoDB needs microsecond read latency with minimal code changes. What should be used?",
    options: ["DynamoDB Accelerator (DAX)", "ElastiCache for Memcached with custom code", "A global secondary index", "DynamoDB Streams"],
    answer: [0],
    explanation:
      "DAX is an in-memory, API-compatible write-through cache for DynamoDB: swap the client and get microsecond reads. ElastiCache needs your own caching logic.",
  },
  {
    id: "trb-11",
    domain: 4,
    q: "Users far from the AWS Region experience slow uploads of large files (several GB) to S3. Which TWO actions improve upload performance? (Choose TWO.)",
    options: [
      "Use multipart upload",
      "Enable S3 Transfer Acceleration",
      "Enable S3 Versioning",
      "Use SSE-KMS",
      "Use S3 Glacier Flexible Retrieval",
    ],
    answer: [0, 1],
    explanation:
      "Multipart upload parallelizes parts (recommended above 100 MB, required above 5 GB). Transfer Acceleration routes traffic through CloudFront edge locations over the AWS backbone.",
  },
  {
    id: "trb-12",
    domain: 4,
    q: "A gaming application needs a real-time leaderboard sorted by score. Which caching engine is the BEST fit?",
    options: ["ElastiCache for Redis (or Valkey) using sorted sets", "ElastiCache for Memcached", "DAX", "CloudFront"],
    answer: [0],
    explanation:
      "Redis/Valkey sorted sets keep members ordered by score with O(log n) updates. Memcached is a simple multi-threaded key-value cache without advanced data structures or persistence.",
  },
  {
    id: "trb-13",
    domain: 4,
    q: "A Lambda function consuming a Kinesis stream falls behind: the IteratorAge metric keeps growing. Which TWO actions help? (Choose TWO.)",
    options: [
      "Increase the ParallelizationFactor on the event source mapping",
      "Add shards to the stream",
      "Decrease the function's memory",
      "Increase the stream retention period only",
      "Switch the producer to the KPL",
    ],
    answer: [0, 1],
    explanation:
      "Lambda processes one batch per shard at a time by default. ParallelizationFactor (up to 10) allows concurrent batches per shard; more shards also add parallelism. Retention only delays data loss.",
  },
  {
    id: "trb-14",
    domain: 4,
    q: "A REST API returns the same product catalog to thousands of users, and the backend is overloaded. Which feature reduces backend calls with minimal effort?",
    options: ["Enable API Gateway stage caching", "Enable a Lambda authorizer", "Add a usage plan", "Enable access logging"],
    answer: [0],
    explanation:
      "API Gateway caching stores responses per stage (default TTL 300 s, max 3600 s). CloudFront in front is another option for global edge caching.",
  },
  {
    id: "trb-15",
    domain: 4,
    q: "A developer must find out which IAM user deleted a DynamoDB table yesterday. Where should they look?",
    options: ["AWS CloudTrail event history", "CloudWatch metrics", "X-Ray service map", "VPC Flow Logs"],
    answer: [0],
    explanation: "CloudTrail records management API calls (who, when, from where). Event history keeps 90 days by default.",
  },
  {
    id: "trb-16",
    domain: 4,
    q: "A developer wants to query Lambda logs across several log groups to find the 20 slowest requests in the last hour. Which tool is designed for this?",
    options: ["CloudWatch Logs Insights", "CloudTrail Lake", "AWS Config", "Amazon Inspector"],
    answer: [0],
    explanation:
      "Logs Insights runs interactive queries (fields, filter, sort, stats) across one or more log groups. Lambda REPORT lines include Duration, Billed Duration and Max Memory Used.",
  },
  {
    id: "trb-17",
    domain: 4,
    q: "An SQS consumer repeatedly fails on a malformed message, which keeps being redelivered. How should this be handled?",
    options: [
      "Configure a dead-letter queue with a redrive policy (maxReceiveCount)",
      "Increase the retention period to 14 days",
      "Enable long polling",
      "Switch to SNS",
    ],
    answer: [0],
    explanation:
      "After maxReceiveCount failed receives, SQS moves the message to the DLQ for inspection. DLQ redrive can later move messages back to the source queue.",
  },

  // ─────────────── DVA-C03 preview — Generative AI for developers ───────────────
  {
    id: "ai-01",
    domain: 1,
    tags: ["c03"],
    q: "A developer wants to call different foundation models in Amazon Bedrock with a single, consistent request/response format, including multi-turn conversations and tool use. Which API should they use?",
    options: ["The Bedrock Converse API", "The SageMaker InvokeEndpoint API", "Amazon Comprehend DetectSentiment", "Amazon Lex PostText"],
    answer: [0],
    explanation:
      "Converse (and ConverseStream) provides a model-agnostic message format with tool use support. InvokeModel requires the model-specific request body.",
  },
  {
    id: "ai-02",
    domain: 1,
    tags: ["c03"],
    q: "A chatbot built on Amazon Bedrock must display the model's answer word by word as it is generated. What should the developer use?",
    options: ["ConverseStream or InvokeModelWithResponseStream", "Batch inference", "Provisioned throughput", "An SQS FIFO queue"],
    answer: [0],
    explanation: "Streaming APIs return the response in chunks as tokens are generated, reducing perceived latency.",
  },
  {
    id: "ai-03",
    domain: 1,
    tags: ["c03"],
    q: "An assistant must answer questions using the company's internal documents stored in S3, without retraining a model. What is the MOST suitable approach?",
    options: [
      "Retrieval-Augmented Generation with Amazon Bedrock Knowledge Bases",
      "Fine-tune a model every night",
      "Paste all documents in every prompt",
      "Use Amazon Rekognition",
    ],
    answer: [0],
    explanation:
      "Knowledge Bases ingest documents, create embeddings in a vector store, and retrieve relevant chunks to ground model answers (RAG), with source citations.",
  },
  {
    id: "ai-04",
    domain: 2,
    tags: ["c03"],
    q: "A generative AI application must block harmful content and redact personally identifiable information (PII) in both prompts and model responses. Which feature should be used?",
    options: ["Amazon Bedrock Guardrails", "AWS WAF rate-based rules", "Amazon Macie", "IAM permission boundaries"],
    answer: [0],
    explanation:
      "Guardrails apply content filters, denied topics, word filters, PII detection/redaction, and contextual grounding checks to inputs and outputs. Macie discovers PII in S3, not in model traffic.",
  },
  {
    id: "ai-05",
    domain: 2,
    tags: ["c03"],
    q: "An AI agent can call tools that read and modify data. Which TWO practices BEST reduce the impact of a prompt-injection attack? (Choose TWO.)",
    options: [
      "Give the agent's tools least-privilege IAM permissions and require confirmation for destructive actions",
      "Apply Bedrock Guardrails (including prompt attack filters) to user input",
      "Put API keys in the system prompt so the model can use them",
      "Grant the agent AdministratorAccess so tools never fail",
      "Disable CloudTrail logging for the agent",
    ],
    answer: [0, 1],
    explanation:
      "Assume the model can be manipulated: limit what tools can do (least privilege, human-in-the-loop) and filter inputs. Never place secrets in prompts.",
  },
  {
    id: "ai-06",
    domain: 2,
    tags: ["c03"],
    q: "A Lambda function calls Amazon Bedrock and gets an AccessDeniedException. What is the MOST likely fix?",
    options: [
      "Add bedrock:InvokeModel (or the needed Bedrock action) for the model ARN to the function's execution role, and confirm the model is available in the Region",
      "Increase the Lambda memory",
      "Enable API Gateway caching",
      "Create an IAM user and embed its keys",
    ],
    answer: [0],
    explanation:
      "Bedrock calls are authorized by IAM like any other service. Converse also uses the bedrock:InvokeModel permission. Model availability varies by Region.",
  },
];
