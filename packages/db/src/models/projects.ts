import { cache } from '@metronome/cache';
import { and, eq, sql } from 'drizzle-orm';
import { buildJsonbObject } from 'src/utils/buildJsonObject';
import { invariant } from 'ts-invariant';

import { db } from '../db';
import { nanoid } from '../modules/nanoid';
import { projects, teams, users, usersToTeams } from '../schema';
import { NewProject, Project, UpdateProjectAttributes } from '../types';
import { observable, operators, throttleTime } from '../utils/events';
import { generateSlug } from '../utils/slugs';

export async function insert(newProject: NewProject) {
  const slug = await generateSlug({
    text: newProject.name || 'projects',
    table: projects,
  });

  const [project] = await db({ write: true })
    .insert(projects)
    .values({
      id: nanoid.id('project'),
      apiKey: nanoid.id('apiKey', 40),
      slug,
      ...newProject,
    })
    .returning();

  return project;
}

export async function update({
  id,
  attributes,
}: {
  id: string;
  attributes: UpdateProjectAttributes;
}): Promise<Project> {
  const [project] = await db({ write: true })
    .update(projects)
    .set({ ...attributes, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.deleted, false)))
    .returning();

  return project;
}

export async function destroy({ id }: { id: string }) {
  await db({ write: true })
    .update(projects)
    .set({ deleted: true, updatedAt: new Date() })
    .where(eq(projects.id, id));
}

export async function find(id: string) {
  const project = await db().query.projects.findFirst({
    where: (projects, { eq, and }) => {
      return and(eq(projects.id, id), eq(projects.deleted, false));
    },
  });

  return project;
}

export async function findBySlug({ projectSlug, userId }: { projectSlug: string; userId: string }) {
  const [entry] = await db()
    .select()
    .from(projects)
    .innerJoin(teams, eq(teams.id, projects.teamId))
    .innerJoin(
      usersToTeams,
      and(eq(usersToTeams.teamId, teams.id), eq(usersToTeams.userId, userId)),
    )
    .where(and(eq(projects.slug, projectSlug), eq(projects.deleted, false)));

  return entry?.projects;
}

export async function findByApiKey({ apiKey }: { apiKey: string }) {
  const project = await db().query.projects.findFirst({
    where: (projects, { eq }) => {
      return eq(projects.apiKey, apiKey);
    },
    with: { team: true },
  });

  return project;
}

export async function findBySlugs({
  teamSlug,
  projectSlug,
  userId,
}: {
  projectSlug: string;
  teamSlug: string;
  userId: string;
}): Promise<Project | undefined> {
  const [entry] = await db()
    .select()
    .from(projects)
    .innerJoin(teams, eq(teams.id, projects.teamId))
    .innerJoin(
      usersToTeams,
      and(
        eq(usersToTeams.teamId, teams.id),
        eq(usersToTeams.userId, userId),
        eq(teams.slug, teamSlug),
      ),
    )
    .where(and(eq(projects.slug, projectSlug), eq(projects.deleted, false)));

  return entry?.projects;
}

export async function findByTeamId({ teamId }: { teamId: string }) {
  const foundProjects = await db()
    .select()
    .from(projects)
    .where(and(eq(projects.deleted, false), eq(projects.teamId, teamId)));

  return foundProjects;
}

export async function rotateApiKey({ id }: { id: string }) {
  const project = await findByApiKey({ apiKey: id });

  invariant(project, `Cannot find project with apiKey ${id}`);

  await db({ write: true })
    .update(projects)
    .set({ apiKey: nanoid.id('apiKey', 40), updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.deleted, false)));

  await cache.forget(id);
}

export async function rotateSalts() {
  await db({ write: true })
    .update(projects)
    .set({
      previousSalt: sql`salt`,
      salt: sql`substr(md5(random()::text),0,33)`,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.deleted, false)));
}

export async function watch(
  project: Project,
  callback: (event: { ts: number }) => Promise<void>,
): Promise<() => void> {
  await callback({ ts: Date.now() });

  const subscription = observable
    .pipe(
      operators.project(project),
      operators.events(['first-event', 'project-client-updated']),
      throttleTime(1000, undefined, { leading: true, trailing: true }),
    )
    .subscribe(async ([e]) => {
      await callback({ ts: e.returnvalue.ts });
    });

  return () => subscription.unsubscribe();
}

export async function getLastViewedProject(userId: string): Promise<Project | null> {
  async function clearSlugs() {
    await db()
      .update(users)
      .set({
        settings: sql`settings::jsonb || ${buildJsonbObject({
          lastSelectedProjectSlug: null,
          lastSelectedTeamSlug: null,
        })}`,
      })
      .where(eq(users.id, userId));
  }

  const [result] = await db()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .innerJoin(usersToTeams, eq(usersToTeams.userId, userId));

  const projectSlug = result?.users?.settings?.lastSelectedProjectSlug;

  const teamSlug = result?.users?.settings?.lastSelectedTeamSlug;

  if (!projectSlug || !teamSlug) {
    if (Boolean(projectSlug) !== Boolean(teamSlug)) {
      await clearSlugs();
    }
    return null;
  }

  // Check if user hass access to the team by slug, project bg slug, and the project is not deleted
  const [project] = await db()
    .select()
    .from(projects)
    .innerJoin(teams, eq(teams.id, projects.teamId))
    .innerJoin(
      usersToTeams,
      and(eq(usersToTeams.teamId, teams.id), eq(usersToTeams.userId, userId)),
    )
    .where(
      and(eq(projects.slug, projectSlug), eq(teams.slug, teamSlug), eq(projects.deleted, false)),
    );

  if (!project) {
    await clearSlugs();
    return null;
  }

  return project.projects;
}

export async function findPublicProjectById(projectId: string): Promise<Project | null> {
  const [project] = await db()
    .select()
    .from(projects)
    .where(
      and(eq(projects.id, projectId), eq(projects.deleted, false), eq(projects.isPublic, true)),
    );

  return project ?? null;
}
