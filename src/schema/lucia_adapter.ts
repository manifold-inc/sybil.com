import { eq, lte } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { type PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import type { Adapter, DatabaseSession, DatabaseUser } from "lucia";

import type { Session, User } from "./schema";

export class LuciaAdapter implements Adapter {
  private db: PlanetScaleDatabase;

  private sessionTable: typeof Session;
  private userTable: typeof User;

  constructor(
    db: PlanetScaleDatabase,
    sessionTable: typeof Session,
    userTable: typeof User,
  ) {
    this.db = db;
    this.sessionTable = sessionTable;
    this.userTable = userTable;
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await this.db
      .delete(this.sessionTable)
      .where(eq(this.sessionTable.id, sessionId));
  }

  public async deleteUserSessions(userId: string): Promise<void> {
    await this.db
      .delete(this.sessionTable)
      .where(eq(this.sessionTable.userId, userId));
  }

  public async getSessionAndUser(
    sessionId: string,
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const result = await this.db
      .select({
        user: this.userTable,
        session: this.sessionTable,
      })
      .from(this.sessionTable)
      .innerJoin(
        this.userTable,
        eq(this.sessionTable.userId, this.userTable.id),
      )
      .where(eq(this.sessionTable.id, sessionId));
    if (result.length !== 1) return [null, null];
    return [
      transformIntoDatabaseSession(result[0]!.session),
      transformIntoDatabaseUser(result[0]!.user),
    ];
  }

  public async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    const result = await this.db
      .select()
      .from(this.sessionTable)
      .where(eq(this.sessionTable.userId, userId));
    return result.map((val) => {
      return transformIntoDatabaseSession(val);
    });
  }

  public async setSession(session: DatabaseSession): Promise<void> {
    await this.db.insert(this.sessionTable).values({
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      ...session.attributes,
    });
  }

  public async updateSessionExpiration(
    sessionId: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db
      .update(this.sessionTable)
      .set({
        expiresAt,
      })
      .where(eq(this.sessionTable.id, sessionId));
  }

  public async deleteExpiredSessions(): Promise<void> {
    await this.db
      .delete(this.sessionTable)
      .where(lte(this.sessionTable.expiresAt, new Date()));
  }
}

function transformIntoDatabaseSession(
  raw: InferSelectModel<typeof Session>,
): DatabaseSession {
  const { id, userId, expiresAt, ...attributes } = raw;
  return {
    userId,
    id,
    expiresAt,
    attributes,
  };
}

function transformIntoDatabaseUser(
  raw: InferSelectModel<typeof User>,
): DatabaseUser {
  const { id, ...attributes } = raw;
  return {
    id,
    attributes,
  };
}
