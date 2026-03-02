-- Update class check to allow Class 6-10
ALTER TABLE public.profiles DROP CONSTRAINT profiles_class_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_class_check CHECK (class = ANY (ARRAY['6','7','8','9','10','11','12','dropper']));

-- Update target_exam check to allow Foundation
ALTER TABLE public.profiles DROP CONSTRAINT profiles_target_exam_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_target_exam_check CHECK (target_exam = ANY (ARRAY['JEE Main','JEE Advanced','Both','NEET','CUET','Foundation']));