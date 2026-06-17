import { db } from '@/db';
import { households, householdMembers, users } from '@/db/schema';
import { and, asc, eq, sql } from 'drizzle-orm';
import { requireUser, getActiveHouseholdPref } from '@/features/auth/session';
import type { Household, User } from '@/db/schema';

export interface MemberRow {
  memberId: number; // id của household_members (để duyệt / đuổi)
  userId: number;
  name: string;
  avatarUrl: string | null;
  role: string;
  monthlyBudget: number;
}

export interface PendingRow {
  memberId: number; // id của household_members
  householdId: number;
  householdName: string;
  userId: number;
  name: string;
  avatarUrl: string | null;
  role: string;
}

export interface Context {
  me: User;
  myHouseholds: Household[]; // các nhà tôi là thành viên (active)
  activeHousehold: Household | null; // nhà đang xem (null = cá nhân)
  isOwner: boolean;
  members: MemberRow[]; // thành viên active của nhà đang xem
}

export async function getContext(): Promise<Context> {
  const me = await requireUser();

  const memberships = await db
    .select({ household: households, role: householdMembers.role })
    .from(householdMembers)
    .innerJoin(households, eq(householdMembers.householdId, households.id))
    .where(and(eq(householdMembers.userId, me.id), eq(householdMembers.status, 'active')))
    .orderBy(asc(households.id));
  const myHouseholds = memberships.map((m) => m.household);

  const pref = await getActiveHouseholdPref();
  let activeHousehold: Household | null;
  if (pref === 'personal') {
    activeHousehold = null;
  } else if (typeof pref === 'number') {
    activeHousehold = myHouseholds.find((h) => h.id === pref) ?? myHouseholds[0] ?? null;
  } else {
    // chưa chọn → mặc định nhà đầu tiên (nếu có)
    activeHousehold = myHouseholds[0] ?? null;
  }

  let members: MemberRow[] = [];
  let isOwner = false;
  if (activeHousehold) {
    isOwner = activeHousehold.ownerId === me.id;
    members = await db
      .select({
        memberId: householdMembers.id,
        userId: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: householdMembers.role,
        monthlyBudget: users.monthlyBudget,
      })
      .from(householdMembers)
      .innerJoin(users, eq(householdMembers.userId, users.id))
      .where(and(eq(householdMembers.householdId, activeHousehold.id), eq(householdMembers.status, 'active')))
      .orderBy(asc(householdMembers.id));
  }

  return { me, myHouseholds, activeHousehold, isOwner, members };
}

export interface HouseholdSummary {
  id: number;
  name: string;
  role: string;
  memberCount: number;
  isOwner: boolean;
}

/** Danh sách các nhà mà user hiện tại là thành viên active (kèm số thành viên). */
export async function getMyHouseholds(): Promise<HouseholdSummary[]> {
  const me = await requireUser();

  const memberships = await db
    .select({ household: households, role: householdMembers.role })
    .from(householdMembers)
    .innerJoin(households, eq(householdMembers.householdId, households.id))
    .where(and(eq(householdMembers.userId, me.id), eq(householdMembers.status, 'active')))
    .orderBy(asc(households.id));

  const counts = await db
    .select({ hid: householdMembers.householdId, n: sql<number>`count(*)::int` })
    .from(householdMembers)
    .where(eq(householdMembers.status, 'active'))
    .groupBy(householdMembers.householdId);
  const countOf = new Map(counts.map((x) => [x.hid, x.n]));

  return memberships.map((m) => ({
    id: m.household.id,
    name: m.household.name,
    role: m.role,
    memberCount: countOf.get(m.household.id) ?? 1,
    isOwner: m.household.ownerId === me.id,
  }));
}

export interface HouseholdView {
  household: Household;
  members: MemberRow[];
  isOwner: boolean;
  me: User;
}

/** Chi tiết một nhà — chỉ trả về nếu user hiện tại là thành viên active. */
export async function getHouseholdView(householdId: number): Promise<HouseholdView | null> {
  const me = await requireUser();

  const [membership] = await db
    .select({ id: householdMembers.id })
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.householdId, householdId),
        eq(householdMembers.userId, me.id),
        eq(householdMembers.status, 'active'),
      ),
    )
    .limit(1);
  if (!membership) return null;

  const [household] = await db.select().from(households).where(eq(households.id, householdId)).limit(1);
  if (!household) return null;

  const members = await db
    .select({
      memberId: householdMembers.id,
      userId: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      role: householdMembers.role,
      monthlyBudget: users.monthlyBudget,
    })
    .from(householdMembers)
    .innerJoin(users, eq(householdMembers.userId, users.id))
    .where(and(eq(householdMembers.householdId, householdId), eq(householdMembers.status, 'active')))
    .orderBy(asc(householdMembers.id));

  return { household, members, isOwner: household.ownerId === me.id, me };
}

const pendingSelect = {
  memberId: householdMembers.id,
  householdId: households.id,
  householdName: households.name,
  userId: users.id,
  name: users.name,
  avatarUrl: users.avatarUrl,
  role: householdMembers.role,
} as const;

/** Yêu cầu tham gia đang chờ của MỘT nhà — chỉ trả về nếu user hiện tại là chủ nhà. */
export async function getHouseholdPending(householdId: number): Promise<PendingRow[]> {
  const me = await requireUser();
  const [home] = await db.select().from(households).where(eq(households.id, householdId)).limit(1);
  if (!home || home.ownerId !== me.id) return [];

  return db
    .select(pendingSelect)
    .from(householdMembers)
    .innerJoin(households, eq(householdMembers.householdId, households.id))
    .innerJoin(users, eq(householdMembers.userId, users.id))
    .where(and(eq(householdMembers.householdId, householdId), eq(householdMembers.status, 'pending')))
    .orderBy(asc(householdMembers.id));
}

/** Các yêu cầu tham gia đang chờ, trên mọi nhà mà user này làm chủ. */
export async function getPendingRequests(ownerId: number): Promise<PendingRow[]> {
  return db
    .select({
      memberId: householdMembers.id,
      householdId: households.id,
      householdName: households.name,
      userId: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      role: householdMembers.role,
    })
    .from(householdMembers)
    .innerJoin(households, eq(householdMembers.householdId, households.id))
    .innerJoin(users, eq(householdMembers.userId, users.id))
    .where(and(eq(households.ownerId, ownerId), eq(householdMembers.status, 'pending')))
    .orderBy(asc(householdMembers.id));
}
