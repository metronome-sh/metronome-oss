import { eq, sql } from 'drizzle-orm';
import { invariant } from 'ts-invariant';
import { randomBytes, scrypt as scryptSync } from 'crypto';
import { promisify } from 'util';
import { db } from '../db';
import { nanoid } from '../modules/nanoid';
import { users, usersToTeams } from '../schema';
import { type NewUser, type UpdateUser, type User } from '../types';
import { buildJsonbObject } from '../utils/buildJsonObject';

const scrypt = promisify(scryptSync);
const HASH_KEY_LENGTH = 64;

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buffer = (await scrypt(password, salt, HASH_KEY_LENGTH)) as Buffer;
  return `${salt}:${buffer.toString('hex')}`;
}

async function verifyPassword(password: string, hashedPassword: string) {
  const [salt, key] = hashedPassword.split(':');
  const buffer = (await scrypt(password, salt, HASH_KEY_LENGTH)) as Buffer;
  return buffer.toString('hex') === key;
}

export async function insert(newUser: NewUser): Promise<User> {
  const hashedPassword: string | null = newUser.password
    ? await hashPassword(newUser.password)
    : null;

  const [createdUser] = await db({ write: true })
    .insert(users)
    .values({ ...newUser, password: hashedPassword, id: nanoid.id('user') })
    .returning();

  return { ...createdUser, usersToTeams: [] };
}

export async function atLeastOneExists(): Promise<boolean> {
  const [result] = await db()
    .select({
      count: sql<number>`count(*)::integer`,
    })
    .from(users);

  return result.count > 0;
}

export async function authenticate(credentials: {
  email: string;
  password: string;
}): Promise<User | null> {
  const userWithPassword = await db().query.users.findFirst({
    where: (users, { eq }) => eq(users.email, credentials.email),
    with: { usersToTeams: { with: { team: true } } },
  });

  if (!userWithPassword) {
    return null;
  }

  const { password, ...user } = userWithPassword;

  const isPasswordValid = await verifyPassword(credentials.password, password ?? '');

  if (!isPasswordValid) return null;

  return user;
}

// eslint-disable-next-line @typescript-eslint/no-shadow
export async function findFirst({ id }: { id: string }): Promise<User | null> {
  const user = await db().query.users.findFirst({
    columns: { password: false },
    where: (users, { eq }) => eq(users.id, id),
    with: { usersToTeams: { with: { team: true } } },
  });

  return user ?? null;
}

export async function findByEmail(email: string): Promise<User | null> {
  const user = await db().query.users.findFirst({
    columns: { password: false },
    where: (users, { eq }) => eq(users.email, email),
    with: { usersToTeams: { with: { team: true } } },
  });

  return user ?? null;
}

export async function upsert({
  getter,
  create,
  update,
}: {
  getter: { strategyUserId: string; strategy: string };
  create: NewUser;
  update: Partial<NewUser>;
}): Promise<User> {
  const user = await db().query.users.findFirst({
    columns: { password: false },
    where: (users, { and, eq }) =>
      and(eq(users.strategyUserId, getter.strategyUserId), eq(users.strategy, getter.strategy)),
    with: { usersToTeams: { with: { team: true } } },
  });

  if (user) {
    const { settings, ...rest } = update;
    await db()
      .update(users)
      .set({
        settings: sql`settings::jsonb || ${buildJsonbObject(settings)}`,
        ...rest,
      })
      .where(eq(users.id, user.id));
    return { ...user, ...update };
  }

  const { settings, ...rest } = create;

  const [createdUser] = await db({ write: true })
    .insert(users)
    .values({
      ...rest,
      settings: sql`${buildJsonbObject(settings)}`,
      id: nanoid.id('user'),
    })
    .returning();

  return { ...createdUser, usersToTeams: [] };
}

export async function addToTeam({ userId, teamId }: { userId: string; teamId: string }) {
  await db({ write: true })
    .insert(usersToTeams)
    .values({
      userId,
      teamId,
    })
    .onConflictDoNothing();
}

export async function lastSelectedProjectSlug({
  userId,
  projectSlug: lastSelectedProjectSlug,
}: {
  userId: string;
  projectSlug: string;
}) {
  await db({ write: true })
    .update(users)
    .set({
      settings: sql`settings::jsonb || ${buildJsonbObject({
        lastSelectedProjectSlug,
      })}`,
    })
    .where(eq(users.id, userId));
}

export async function lastSelectedTeamSlug({
  userId,
  teamSlug: lastSelectedTeamSlug,
}: {
  userId: string;
  teamSlug: string;
}) {
  await db({ write: true })
    .update(users)
    .set({
      settings: sql`settings::jsonb || ${buildJsonbObject({
        lastSelectedTeamSlug,
      })}`,
    })
    .where(eq(users.id, userId));
}

export async function getTeams({ userId }: { userId: string }) {
  const teams = await db().query.usersToTeams.findMany({
    where: (usersToTeams, { eq }) => eq(usersToTeams.userId, userId),
    with: { team: true },
  });

  return teams.map(({ team }) => team);
}

export async function updateSettings(userId: string, settings: Partial<User['settings']>) {
  const [user] = await db({ write: true })
    .update(users)
    .set({
      settings: sql`settings::jsonb || ${buildJsonbObject({ ...settings })}`,
    })
    .where(eq(users.id, userId))
    .returning();

  return user;
}

export async function update(userId: string, update: UpdateUser) {
  const { settings, ...rest } = update;

  const [user] = await db({ write: true })
    .update(users)
    .set({ ...rest, settings: sql`settings::jsonb || ${buildJsonbObject(settings)}` })
    .where(eq(users.id, userId))
    .returning();

  return user;
}

export async function markNotificationAsSeen(userId: string, notificationId: string) {
  const user = await findFirst({ id: userId });

  invariant(user, 'User not found');

  const seenNotifications = user.settings?.seenNotifications ?? [];

  if (seenNotifications.includes(notificationId)) {
    return;
  }

  await db({ write: true })
    .update(users)
    .set({
      settings: sql`settings::jsonb || ${buildJsonbObject({
        seenNotifications: [...seenNotifications, notificationId],
      })}`,
    })
    .where(eq(users.id, userId));
}

export async function resetUserPassord(newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);

  const [user] = await db({ write: true })
    .select({ id: users.id, email: users.email })
    .from(users)
    .limit(1);

  await db({ write: true })
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, user.id));

  return user.email;
}
