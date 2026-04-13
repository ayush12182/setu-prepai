-- Migration: B2B Overview Analytics Optimization
-- 20260413170000_b2b_analytics_rpc.sql

CREATE OR REPLACE FUNCTION public.get_b2b_overview_stats(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_students INTEGER;
    v_active_batches INTEGER;
    v_tests_created INTEGER;
    v_overall_accuracy NUMERIC;
    v_batch_stats JSONB;
    v_topic_stats JSONB;
BEGIN
    -- 1. Active batches count
    SELECT COUNT(*) INTO v_active_batches
    FROM public.batches
    WHERE organization_id = p_organization_id AND is_active = true;

    -- 2. Total unique students in the organization
    SELECT COUNT(DISTINCT student_id) INTO v_total_students
    FROM public.batch_members bm
    JOIN public.batches b ON b.id = bm.batch_id
    WHERE b.organization_id = p_organization_id;

    -- 3. Total assessment sessions created
    SELECT COUNT(*) INTO v_tests_created
    FROM public.assessment_sessions asess
    JOIN public.batches b ON b.id = asess.batch_id
    WHERE b.organization_id = p_organization_id;

    -- 4. Overall accuracy across the organization
    SELECT COALESCE(AVG(p.live_accuracy), 0) INTO v_overall_accuracy
    FROM public.session_participants p
    JOIN public.assessment_sessions asess ON asess.id = p.session_id
    JOIN public.batches b ON b.id = asess.batch_id
    WHERE b.organization_id = p_organization_id
      AND p.status = 'SUBMITTED';

    -- 5. Batch-level stats
    SELECT json_agg(batch_row) INTO v_batch_stats
    FROM (
        SELECT 
            b.id,
            b.name,
            COUNT(DISTINCT bm.student_id) as students,
            ROUND(COALESCE(AVG(p.live_accuracy), 0)::numeric, 1) as avg_accuracy
        FROM public.batches b
        LEFT JOIN public.batch_members bm ON bm.batch_id = b.id
        LEFT JOIN public.assessment_sessions asess ON asess.batch_id = b.id
        LEFT JOIN public.session_participants p ON p.session_id = asess.id AND p.status = 'SUBMITTED'
        WHERE b.organization_id = p_organization_id AND b.is_active = true
        GROUP BY b.id, b.name
    ) batch_row;

    -- 6. Topic-level stats (from session metadata)
    SELECT json_agg(topic_row) INTO v_topic_stats
    FROM (
        SELECT 
            asess.exam_type as topic, -- fallback if no metadata subject
            ROUND(AVG(p.live_accuracy)::numeric, 1) as accuracy
        FROM public.assessment_sessions asess
        JOIN public.session_participants p ON p.session_id = asess.id
        JOIN public.batches b ON b.id = asess.batch_id
        WHERE b.organization_id = p_organization_id 
          AND p.status = 'SUBMITTED'
        GROUP BY asess.exam_type
    ) topic_row;

    RETURN json_build_object(
        'totalStudents', v_total_students,
        'activeBatches', v_active_batches,
        'testsCreated', v_tests_created,
        'avgAccuracy', ROUND(v_overall_accuracy, 1),
        'batches', COALESCE(v_batch_stats, '[]'::jsonb),
        'topicAccuracy', COALESCE(v_topic_stats, '[]'::jsonb)
    );
END;
$$;
