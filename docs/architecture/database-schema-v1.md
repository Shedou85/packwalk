# PackWalk Database Schema v1

## Core Entities

### profiles

Stores user-facing profile data linked to Supabase Auth users.

Key fields:

- `id`
- `username`
- `display_name`
- `avatar_url`
- `bio`
- `city`
- `language`
- `default_visibility`
- `default_location_precision`
- `created_at`
- `updated_at`

### dogs

Stores dog profiles owned by users.

Key fields:

- `id`
- `owner_id`
- `name`
- `breed`
- `age_years`
- `size`
- `temperament`
- `photo_url`
- `created_at`

### walk_sessions

Represents an active or completed walk session.

Key fields:

- `id`
- `user_id`
- `status`
- `visibility`
- `location_precision`
- `title`
- `started_at`
- `ended_at`
- `expires_at`
- `last_latitude`
- `last_longitude`
- `last_accuracy_meters`
- `created_at`

### location_pings

Stores timestamped location updates during a walk.

Key fields:

- `id`
- `walk_session_id`
- `user_id`
- `latitude`
- `longitude`
- `accuracy_meters`
- `recorded_at`

### follows

Represents a one-way follow relationship between users.

Key fields:

- `follower_id`
- `following_id`
- `created_at`

### groups

Stores meetup groups.

Key fields:

- `id`
- `owner_id`
- `name`
- `description`
- `privacy`
- `avatar_url`
- `created_at`
- `updated_at`

### group_members

Stores membership and role inside groups.

Key fields:

- `group_id`
- `user_id`
- `role`
- `status`
- `joined_at`

### group_messages

Stores chat messages inside groups.

Key fields:

- `id`
- `group_id`
- `sender_id`
- `body`
- `message_type`
- `created_at`

### notifications

Stores in-app notifications.

Key fields:

- `id`
- `user_id`
- `actor_id`
- `type`
- `title`
- `body`
- `payload`
- `read_at`
- `created_at`

## Suggested Enums

- `visibility`: `public`, `followers`, `private_group`
- `location_precision`: `exact`, `approximate`
- `walk_status`: `active`, `ended`, `expired`
- `group_privacy`: `public`, `private`
- `group_role`: `owner`, `admin`, `member`
- `group_member_status`: `invited`, `active`, `left`
- `message_type`: `text`, `system`

## Notes

- A user should only appear in discovery while they have an `active` walk session.
- Approximate location can be derived at write time or returned through a privacy-aware view later.
- Row Level Security should eventually restrict access to walks, groups, and notifications based on visibility and membership rules.
- `profiles.id` should match `auth.users.id`.
