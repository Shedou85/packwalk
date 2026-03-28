import { redirect } from "next/navigation";

import { createGroup, joinGroup } from "@/app/groups/actions";
import { appNavItems } from "@/components/navigation/app-nav-items";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { CompactSelect } from "@/components/ui/compact-select";
import { Field, TextInput } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";
import { createClient } from "@/lib/supabase/server";

type GroupsPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [{ data: myMemberships }, { data: publicGroups }] = await Promise.all([
    supabase
      .from("group_members")
      .select("group_id, role, groups(id, name, description, privacy, created_at)")
      .eq("user_id", user.id)
      .eq("status", "active"),
    supabase
      .from("groups")
      .select("id, name, description, privacy, created_at")
      .eq("privacy", "public")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const myGroupIds = new Set(
    (myMemberships ?? []).map((m) => m.group_id),
  );

  const myGroups = (myMemberships ?? []).map((m) => ({
    id: m.group_id,
    role: m.role,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(m.groups as any),
  })) as {
    id: string;
    role: string;
    name: string;
    description: string | null;
    privacy: string;
    created_at: string;
  }[];

  const discoverGroups = (publicGroups ?? []).filter(
    (g) => !myGroupIds.has(g.id),
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-6">
      <SurfaceCard
        strong
        className="overflow-hidden rounded-[28px] px-4 py-5 sm:px-6 sm:py-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
          PackWalk groups
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
          Your groups
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
          Create or join groups to coordinate walks with friends, neighbors, or
          the wider community.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>{myGroups.length} groups</Pill>
        </div>
      </SurfaceCard>

      <section className="mt-4 flex flex-1 flex-col gap-4 sm:mt-6 sm:gap-6">
        {(params.message || params.error) && (
          <SurfaceCard className="p-5 sm:p-6">
            {params.message ? (
              <Notice>{params.message}</Notice>
            ) : null}
            {params.error ? (
              <Notice variant="error">{params.error}</Notice>
            ) : null}
          </SurfaceCard>
        )}

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SurfaceCard className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-strong)]">
                  My groups
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  Groups you own or have joined. Tap a group to see members and
                  details.
                </p>
              </div>
              <Pill>{myGroups.length}</Pill>
            </div>

            {myGroups.length ? (
              <div className="mt-5 grid gap-3">
                {myGroups.map((group) => (
                  <ButtonLink
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="block w-full rounded-[24px] border border-white/70 bg-white/65 p-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--text-strong)]">
                        {group.name}
                      </p>
                      <div className="flex gap-2">
                        <Pill>{group.privacy}</Pill>
                        <Pill>{group.role}</Pill>
                      </div>
                    </div>
                    {group.description ? (
                      <p className="mt-2 line-clamp-2 text-xs text-[var(--text-soft)]">
                        {group.description}
                      </p>
                    ) : null}
                  </ButtonLink>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-[var(--text-body)]">
                No groups yet. Create one or join a public group to get started.
              </p>
            )}
          </SurfaceCard>

          <SurfaceCard className="p-5 sm:p-6">
            <div>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                Create a group
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                Start a new group for your walking crew. Choose public to let
                anyone join, or private to invite members yourself.
              </p>
            </div>

            <form action={createGroup} className="mt-5 space-y-4">
              <Field htmlFor="name" label="Group name">
                <TextInput
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Morning park crew"
                />
              </Field>

              <Field htmlFor="description" label="Description">
                <TextInput
                  id="description"
                  name="description"
                  type="text"
                  placeholder="Daily walks at Riverside Park"
                />
              </Field>

              <Field htmlFor="privacy" label="Privacy">
                <CompactSelect
                  name="privacy"
                  defaultValue="private"
                  placeholder="Choose privacy"
                  options={[
                    {
                      value: "public",
                      label: "Public",
                      description: "Anyone can discover and join.",
                    },
                    {
                      value: "private",
                      label: "Private",
                      description: "Members are added by the owner.",
                    },
                  ]}
                />
              </Field>

              <Button className="w-full">Create group</Button>
            </form>
          </SurfaceCard>
        </div>

        {discoverGroups.length > 0 && (
          <SurfaceCard className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-strong)]">
                  Discover groups
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  Public groups you can join right away.
                </p>
              </div>
              <Pill>{discoverGroups.length} available</Pill>
            </div>

            <div className="mt-5 grid gap-3">
              {discoverGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-white/70 bg-white/65 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text-strong)]">
                      {group.name}
                    </p>
                    {group.description ? (
                      <p className="mt-1 line-clamp-1 text-xs text-[var(--text-soft)]">
                        {group.description}
                      </p>
                    ) : null}
                  </div>
                  <form action={joinGroup}>
                    <input type="hidden" name="groupId" value={group.id} />
                    <Button className="whitespace-nowrap px-4 py-2">
                      Join
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </SurfaceCard>
        )}
      </section>

      <MobileBottomNav items={appNavItems} />
    </main>
  );
}
