# Database Schema

PrepEntrance uses a PostgreSQL database hosted on Supabase.

## Entity Relationship Diagram

```mermaid
erDiagram
    student_profiles ||--o{ attempts : "makes"
    student_profiles ||--o{ analytics : "has"
    student_profiles {
        uuid id PK
        string full_name
        string email
        string target_exam "JEE, NEET, CUET"
        boolean is_pro
        timestamp created_at
    }

    batches ||--o{ student_profiles : "contains"
    batches {
        uuid id PK
        string name
        string target_year
    }

    tests ||--o{ attempts : "taken_as"
    tests ||--o{ questions : "contains"
    tests {
        uuid id PK
        string title
        string subject
        int duration_minutes
    }

    questions ||--o{ attempts : "answered_in"
    questions {
        uuid id PK
        string subject
        string chapter
        text content
        json options
        string correct_option
        string difficulty
    }

    attempts {
        uuid id PK
        uuid student_id FK
        uuid test_id FK
        int score
        json responses
        timestamp submitted_at
    }

    analytics {
        uuid id PK
        uuid student_id FK
        string subject
        float proficiency_score
        timestamp last_updated
    }
```

## Security
- **Row Level Security (RLS)** is enabled on all tables.
- Students can only `SELECT`, `UPDATE`, or `INSERT` rows where `student_id = auth.uid()`.
- `questions` and `tests` are publicly readable but only writable by admins.
