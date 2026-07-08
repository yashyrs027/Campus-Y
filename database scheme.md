## Table `roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `role_id` | `int8` | Primary |
| `role_name` | `varchar` |  Unique |
| `created_at` | `timestamptz` |  |

## Table `departments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `department_id` | `int8` | Primary Identity |
| `department_name` | `varchar` |  Unique |
| `department_code` | `varchar` |  Unique |
| `created_at` | `timestamptz` |  |

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `int8` | Primary Identity |
| `department_id` | `int8` |  |
| `role_id` | `int8` |  |
| `first_name` | `varchar` |  |
| `last_name` | `varchar` |  |
| `email` | `citext` |  Unique |
| `phone` | `varchar` |  Nullable Unique |
| `password_hash` | `text` |  |
| `profile_image` | `text` |  Nullable |
| `gender` | `gender_enum` |  |
| `student_id` | `varchar` |  Nullable Unique |
| `employee_id` | `varchar` |  Nullable Unique |
| `is_verified` | `bool` |  |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `clubs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `club_id` | `int8` | Primary Identity |
| `club_name` | `varchar` |  Unique |
| `description` | `text` |  |
| `department_id` | `int8` |  |
| `faculty_coordinator_id` | `int8` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `is_active` | `bool` |  |

## Table `club_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `club_member_id` | `int8` | Primary Identity |
| `club_id` | `int8` |  |
| `user_id` | `int8` |  |
| `position` | `club_position_enum` |  |
| `joined_at` | `timestamptz` |  |
| `status` | `club_member_status_enum` |  |

## Table `event_categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `category_id` | `int8` | Primary Identity |
| `category_name` | `varchar` |  Unique |
| `description` | `text` |  |
| `is_active` | `bool` |  |

## Table `event_proposals`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `proposal_id` | `int8` | Primary Identity |
| `club_id` | `int8` |  |
| `created_by` | `int8` |  |
| `category_id` | `int8` |  |
| `title` | `varchar` |  |
| `description` | `text` |  |
| `venue` | `varchar` |  |
| `start_date` | `date` |  |
| `end_date` | `date` |  |
| `expected_participants` | `int4` |  |
| `status` | `proposal_status_enum` |  |
| `rejection_reason` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `proposal_approvals`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `approval_id` | `int8` | Primary Identity |
| `proposal_id` | `int8` |  |
| `reviewer_id` | `int8` |  |
| `approval_level` | `approval_level_enum` |  |
| `status` | `approval_status_enum` |  |
| `remarks` | `text` |  Nullable |
| `reviewed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `event_id` | `int8` | Primary Identity |
| `proposal_id` | `int8` |  Unique |
| `category_id` | `int8` |  |
| `created_by` | `int8` |  |
| `title` | `varchar` |  |
| `description` | `text` |  |
| `venue` | `varchar` |  |
| `banner` | `text` |  Nullable |
| `start_datetime` | `timestamptz` |  |
| `end_datetime` | `timestamptz` |  |
| `capacity` | `int4` |  |
| `current_registrations` | `int4` |  |
| `registration_deadline` | `timestamptz` |  |
| `status` | `event_status_enum` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `event_registrations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `registration_id` | `int8` | Primary Identity |
| `event_id` | `int8` |  |
| `student_id` | `int8` |  |
| `registration_date` | `timestamptz` |  |
| `status` | `registration_status_enum` |  |

