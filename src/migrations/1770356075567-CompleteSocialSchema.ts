import { MigrationInterface, QueryRunner } from "typeorm";

export class CompleteSocialSchema1770356075567 implements MigrationInterface {
    name = 'CompleteSocialSchema1770356075567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "hashtags" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tag" varchar NOT NULL, CONSTRAINT "UQ_0b4ef8e83392129fb3373fdb3af" UNIQUE ("tag"))`);
        await queryRunner.query(`CREATE TABLE "likes" ("userId" integer NOT NULL, "postId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), PRIMARY KEY ("userId", "postId"))`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer)`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar NOT NULL, "referenceId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "email" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "follow" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "followerId" integer NOT NULL, "followingId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_2952595a5bec0052c5da0751cca" UNIQUE ("followerId", "followingId"))`);
        await queryRunner.query(`CREATE TABLE "post_hashtags" ("postsId" integer NOT NULL, "hashtagsId" integer NOT NULL, PRIMARY KEY ("postsId", "hashtagsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_aea7aa32b50c671eb48d7aeb82" ON "post_hashtags" ("postsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_93f4f6c26818edb5aa6b809856" ON "post_hashtags" ("hashtagsId") `);
        await queryRunner.query(`CREATE TABLE "follows" ("followerId" integer NOT NULL, "followingId" integer NOT NULL, PRIMARY KEY ("followerId", "followingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fdb91868b03a2040db408a5333" ON "follows" ("followerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef463dd9a2ce0d673350e36e0f" ON "follows" ("followingId") `);
        await queryRunner.query(`CREATE TABLE "temporary_likes" ("userId" integer NOT NULL, "postId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_cfd8e81fac09d7339a32e57d904" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("userId", "postId"))`);
        await queryRunner.query(`INSERT INTO "temporary_likes"("userId", "postId", "createdAt") SELECT "userId", "postId", "createdAt" FROM "likes"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`ALTER TABLE "temporary_likes" RENAME TO "likes"`);
        await queryRunner.query(`CREATE TABLE "temporary_posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer, CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_posts"("id", "content", "createdAt", "updatedAt", "authorId") SELECT "id", "content", "createdAt", "updatedAt", "authorId" FROM "posts"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(`CREATE TABLE "temporary_activities" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar NOT NULL, "referenceId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_5a2cfe6f705df945b20c1b22c71" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_activities"("id", "userId", "type", "referenceId", "createdAt") SELECT "id", "userId", "type", "referenceId", "createdAt" FROM "activities"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`ALTER TABLE "temporary_activities" RENAME TO "activities"`);
        await queryRunner.query(`CREATE TABLE "temporary_follow" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "followerId" integer NOT NULL, "followingId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_2952595a5bec0052c5da0751cca" UNIQUE ("followerId", "followingId"), CONSTRAINT "FK_550dce89df9570f251b6af2665a" FOREIGN KEY ("followerId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_e9f68503556c5d72a161ce38513" FOREIGN KEY ("followingId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_follow"("id", "followerId", "followingId", "createdAt") SELECT "id", "followerId", "followingId", "createdAt" FROM "follow"`);
        await queryRunner.query(`DROP TABLE "follow"`);
        await queryRunner.query(`ALTER TABLE "temporary_follow" RENAME TO "follow"`);
        await queryRunner.query(`DROP INDEX "IDX_aea7aa32b50c671eb48d7aeb82"`);
        await queryRunner.query(`DROP INDEX "IDX_93f4f6c26818edb5aa6b809856"`);
        await queryRunner.query(`CREATE TABLE "temporary_post_hashtags" ("postsId" integer NOT NULL, "hashtagsId" integer NOT NULL, CONSTRAINT "FK_aea7aa32b50c671eb48d7aeb82b" FOREIGN KEY ("postsId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_93f4f6c26818edb5aa6b809856f" FOREIGN KEY ("hashtagsId") REFERENCES "hashtags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("postsId", "hashtagsId"))`);
        await queryRunner.query(`INSERT INTO "temporary_post_hashtags"("postsId", "hashtagsId") SELECT "postsId", "hashtagsId" FROM "post_hashtags"`);
        await queryRunner.query(`DROP TABLE "post_hashtags"`);
        await queryRunner.query(`ALTER TABLE "temporary_post_hashtags" RENAME TO "post_hashtags"`);
        await queryRunner.query(`CREATE INDEX "IDX_aea7aa32b50c671eb48d7aeb82" ON "post_hashtags" ("postsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_93f4f6c26818edb5aa6b809856" ON "post_hashtags" ("hashtagsId") `);
        await queryRunner.query(`DROP INDEX "IDX_fdb91868b03a2040db408a5333"`);
        await queryRunner.query(`DROP INDEX "IDX_ef463dd9a2ce0d673350e36e0f"`);
        await queryRunner.query(`CREATE TABLE "temporary_follows" ("followerId" integer NOT NULL, "followingId" integer NOT NULL, CONSTRAINT "FK_fdb91868b03a2040db408a53331" FOREIGN KEY ("followerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_ef463dd9a2ce0d673350e36e0fb" FOREIGN KEY ("followingId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("followerId", "followingId"))`);
        await queryRunner.query(`INSERT INTO "temporary_follows"("followerId", "followingId") SELECT "followerId", "followingId" FROM "follows"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`ALTER TABLE "temporary_follows" RENAME TO "follows"`);
        await queryRunner.query(`CREATE INDEX "IDX_fdb91868b03a2040db408a5333" ON "follows" ("followerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef463dd9a2ce0d673350e36e0f" ON "follows" ("followingId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_ef463dd9a2ce0d673350e36e0f"`);
        await queryRunner.query(`DROP INDEX "IDX_fdb91868b03a2040db408a5333"`);
        await queryRunner.query(`ALTER TABLE "follows" RENAME TO "temporary_follows"`);
        await queryRunner.query(`CREATE TABLE "follows" ("followerId" integer NOT NULL, "followingId" integer NOT NULL, PRIMARY KEY ("followerId", "followingId"))`);
        await queryRunner.query(`INSERT INTO "follows"("followerId", "followingId") SELECT "followerId", "followingId" FROM "temporary_follows"`);
        await queryRunner.query(`DROP TABLE "temporary_follows"`);
        await queryRunner.query(`CREATE INDEX "IDX_ef463dd9a2ce0d673350e36e0f" ON "follows" ("followingId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fdb91868b03a2040db408a5333" ON "follows" ("followerId") `);
        await queryRunner.query(`DROP INDEX "IDX_93f4f6c26818edb5aa6b809856"`);
        await queryRunner.query(`DROP INDEX "IDX_aea7aa32b50c671eb48d7aeb82"`);
        await queryRunner.query(`ALTER TABLE "post_hashtags" RENAME TO "temporary_post_hashtags"`);
        await queryRunner.query(`CREATE TABLE "post_hashtags" ("postsId" integer NOT NULL, "hashtagsId" integer NOT NULL, PRIMARY KEY ("postsId", "hashtagsId"))`);
        await queryRunner.query(`INSERT INTO "post_hashtags"("postsId", "hashtagsId") SELECT "postsId", "hashtagsId" FROM "temporary_post_hashtags"`);
        await queryRunner.query(`DROP TABLE "temporary_post_hashtags"`);
        await queryRunner.query(`CREATE INDEX "IDX_93f4f6c26818edb5aa6b809856" ON "post_hashtags" ("hashtagsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_aea7aa32b50c671eb48d7aeb82" ON "post_hashtags" ("postsId") `);
        await queryRunner.query(`ALTER TABLE "follow" RENAME TO "temporary_follow"`);
        await queryRunner.query(`CREATE TABLE "follow" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "followerId" integer NOT NULL, "followingId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_2952595a5bec0052c5da0751cca" UNIQUE ("followerId", "followingId"))`);
        await queryRunner.query(`INSERT INTO "follow"("id", "followerId", "followingId", "createdAt") SELECT "id", "followerId", "followingId", "createdAt" FROM "temporary_follow"`);
        await queryRunner.query(`DROP TABLE "temporary_follow"`);
        await queryRunner.query(`ALTER TABLE "activities" RENAME TO "temporary_activities"`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar NOT NULL, "referenceId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "activities"("id", "userId", "type", "referenceId", "createdAt") SELECT "id", "userId", "type", "referenceId", "createdAt" FROM "temporary_activities"`);
        await queryRunner.query(`DROP TABLE "temporary_activities"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer)`);
        await queryRunner.query(`INSERT INTO "posts"("id", "content", "createdAt", "updatedAt", "authorId") SELECT "id", "content", "createdAt", "updatedAt", "authorId" FROM "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`ALTER TABLE "likes" RENAME TO "temporary_likes"`);
        await queryRunner.query(`CREATE TABLE "likes" ("userId" integer NOT NULL, "postId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), PRIMARY KEY ("userId", "postId"))`);
        await queryRunner.query(`INSERT INTO "likes"("userId", "postId", "createdAt") SELECT "userId", "postId", "createdAt" FROM "temporary_likes"`);
        await queryRunner.query(`DROP TABLE "temporary_likes"`);
        await queryRunner.query(`DROP INDEX "IDX_ef463dd9a2ce0d673350e36e0f"`);
        await queryRunner.query(`DROP INDEX "IDX_fdb91868b03a2040db408a5333"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`DROP INDEX "IDX_93f4f6c26818edb5aa6b809856"`);
        await queryRunner.query(`DROP INDEX "IDX_aea7aa32b50c671eb48d7aeb82"`);
        await queryRunner.query(`DROP TABLE "post_hashtags"`);
        await queryRunner.query(`DROP TABLE "follow"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`DROP TABLE "hashtags"`);
    }

}
