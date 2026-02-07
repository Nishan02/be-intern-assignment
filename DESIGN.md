Backend Database Documentation

This overview details the SQLite schema and the relational logic implemented via TypeORM for the social media API.

1. Core Entities
User Table (users)

This is the primary identity table for the application.

Fields

id (PK)

firstName

lastName

email (Unique)

createdAt

updatedAt

Logic

One-to-Many relationship with Post (authoring)

Connected to Like and Activity for tracking user engagement

Self-referencing Many-to-Many relationship for follower/following
(via the follows table)

Post Table (posts)

Contains all user-generated content.

Fields

id (PK)

content (Text)

authorId (FK)

createdAt

updatedAt

Logic

Many-to-One with User (author)

Many-to-Many with Hashtag for categorization
(via post_hashtags junction table)

One-to-Many with Like to track post popularity

Like Table (likes)

A junction table managing post interactions.

Fields

userId (PK / FK)

postId (PK / FK)

createdAt

Logic

Uses a composite primary key (userId + postId)

Ensures a user can like a specific post only once

Hashtag Table (hashtags)

Stores unique tags used across the platform.

Fields

id (PK)

tag (Unique string)

Logic

Many-to-Many relationship with Post

Tags are normalized (lowercase) before saving to prevent duplicates
(e.g., #Tech vs #tech)

Activity Table (activities)

A centralized log for user action history.

Fields

id (PK)

userId (FK)

type (Enum)

referenceId (Target ID)

createdAt

Logic

Tracks events like POST_CREATED, FOLLOWED

referenceId points to the object involved in the action

2. Relational Mapping (ERD)

(Entity Relationship Diagram representation can be added here)

3. Data Performance (Indexing)

Several indexes are set up to keep the API responsive as the database grows, especially for feed and search endpoints.

Table	Index Target	Purpose
users	email	Speeds up login and registration checks
posts	authorId	Optimizes loading posts for a profile
activities	userId, createdAt	Enables fast chronological activity queries
hashtags	tag	Speeds up topic-based searches
4. Key Design Decisions

Self-Referencing Follows
A single junction table is used with followerId and followingId both referencing the User entity.

Conflict Prevention
Composite keys in the Like entity move “already liked” validation to the database layer for stronger consistency.

Automated Cleanup
Relationships use onDelete: 'CASCADE' where appropriate
(e.g., deleting a user removes related activity logs).

5. Potential Improvements

Caching
Use Redis for high-traffic data (e.g., follower counts) to reduce database load.

Search Enhancements
Upgrade from basic SQLite matching to FTS5 for richer post search capabilities.

Scalability
Introduce background workers to archive or prune activity logs older than 6 months.